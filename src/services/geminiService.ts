
import { GoogleGenAI, Chat, Modality, Type } from "@google/genai";
import { Program, SimulationFeedback, ChatMessage } from '../types';

// Fix: Corrected API key retrieval to use process.env.API_KEY directly, as per coding guidelines.
// The execution environment is assumed to have this variable pre-configured and accessible.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const runChat = async (programName: string, history: ChatMessage[], newPrompt: string): Promise<string> => {
  const systemInstruction = `You are AdmitAI Global, a world-class AI mentor for high school students aiming for elite global programs. You have comprehensive knowledge of top programs like Pioneer Research, YYGS, RSI, LaunchX, TKS, Regeneron ISEF, The Gates Scholarship, and many more, across all fields from STEM to Humanities.
When a student mentions a program, your task is to act as an expert on it. You are currently assisting with the ${programName} application.
Your guidance must be:
1.  **Informative & Strategic**: Briefly explain the program's focus, prestige, and key deadlines. Provide insider tips on what makes an application stand out for *this specific program*.
2.  **Structured & Actionable**: Break down the entire application into a clear, step-by-step checklist. Proactively guide the student through each step.
3.  **A Creative Partner**: Actively help brainstorm and draft compelling essays, structure a resume, prepare for interviews, and refine project ideas. Go beyond generic advice.
4.  **Motivational**: Share insights or (simulated) quotes from past participants to inspire the student. Maintain an encouraging, positive, and highly knowledgeable tone.
Your goal is to be the ultimate application co-pilot, turning a stressful process into an empowering journey.`;
  
  const geminiHistory = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  try {
     const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: geminiHistory,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const response = await chat.sendMessage({ message: newPrompt });
    return response.text;
  } catch (error) {
    console.error("Error running chat:", error);
    return "I'm sorry, I encountered an error. Could you please try again?";
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say in a friendly, clear, and encouraging voice for a high school student: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
};

export const getSimulationFeedback = async (program: Program, applicationData: Record<string, string>): Promise<SimulationFeedback> => {
  const systemInstruction = `You are a highly experienced admissions officer for the ${program.title}. Your task is to provide a critical, constructive, and encouraging review of a student's application draft.
  Analyze the provided application sections for clarity, grammar, tone, and alignment with the program's values (e.g., leadership, research aptitude, innovation).
  You must provide an overall score out of 10, overall feedback, and then detailed feedback for each individual section.
  Your response must be in the specified JSON format.`;
  
  const userPrompt = `Please review my application for the ${program.title}. Here are my responses:\n\n${JSON.stringify(applicationData, null, 2)}`;
  
  try {
     const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
       config: {
         systemInstruction: systemInstruction,
         responseMimeType: "application/json",
         responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: {
                type: Type.NUMBER,
                description: 'A numerical score from 0 to 10, can be a decimal.'
              },
              overallFeedback: {
                type: Type.STRING,
                description: 'A summary of the application\'s main strengths and areas for improvement.'
              },
              sectionFeedback: {
                type: Type.ARRAY,
                description: 'An array of feedback objects for each section of the application.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sectionName: {
                      type: Type.STRING,
                      description: 'The name of the application section being reviewed.'
                    },
                    strengths: {
                      type: Type.STRING,
                      description: 'Specific positive aspects of the response in this section.'
                    },
                    improvements: {
                      type: Type.STRING,
                      description: 'Specific, actionable advice for improving the response in this section.'
                    }
                  },
                  required: ['sectionName', 'strengths', 'improvements']
                }
              }
            },
            required: ['overallScore', 'overallFeedback', 'sectionFeedback']
          },
       },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as SimulationFeedback;
  } catch (error) {
    console.error("Error getting simulation feedback:", error);
    // Return a structured error to be handled by the UI
    return {
        overallScore: 0,
        overallFeedback: "I'm sorry, an error occurred while analyzing your application. Please check the console for details and try again.",
        sectionFeedback: []
    };
  }
};


// --- Audio Decoding Helper Functions ---
// These are necessary because the Gemini TTS API returns raw PCM audio data.

// Decodes a base64 string into a Uint8Array.
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Decodes raw PCM audio data into an AudioBuffer that the browser can play.
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
