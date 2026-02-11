import { GoogleGenAI, Type } from "@google/genai";
import { MODEL_TIERS } from "@/constants";

// Standardizing on GEMINI_API_KEY for the environment
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const decomposeObjective = async (objective: string): Promise<Array<{ role: string; description: string; tier: 'FLASH' | 'PRO' }>> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TIERS.PRO,
      contents: `Act as the Root Architect. Analyze the following high-level technical objective and decompose it into 3-5 specialized sub-agent roles required to execute it. 
      Objective: "${objective}"
      
      Requirements:
      1. Assign 'FLASH' tier to roles requiring high-speed I/O (e.g., DevOps, Scanning).
      2. Assign 'PRO' tier to roles requiring complex reasoning (e.g., Security Audit, Architecture).
      
      Return JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            agents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING, description: "Title of the agent (e.g., Backend Architect)" },
                  description: { type: Type.STRING, description: "Short description of responsibility" },
                  tier: { type: Type.STRING, enum: ["FLASH", "PRO"] }
                },
                required: ["role", "description", "tier"]
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{"agents": []}');
    return result.agents;
  } catch (error) {
    console.error("Agent Decomposition Error:", error);
    return [
      { role: "System Fallback Agent", description: "Manual override active", tier: "FLASH" },
      { role: "Error Handler", description: "Monitoring system instability", tier: "FLASH" }
    ];
  }
};

export const proposeSubAgent = async (parentRole: string, currentContext: string): Promise<{ role: string; tier: 'FLASH' | 'PRO' }> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TIERS.FLASH,
      contents: `You are the Root Architect. A parent agent "${parentRole}" is requesting additional resources.
      Current Context: "${currentContext}"
      
      Define a SINGLE specific sub-agent role to delegate a specific task to.
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING },
            tier: { type: Type.STRING, enum: ["FLASH", "PRO"] }
          },
          required: ["role", "tier"]
        }
      }
    });

    return JSON.parse(response.text || '{"role": "Sub-Process Node", "tier": "FLASH"}');
  } catch (e) {
    return { role: "Auxiliary Process", tier: "FLASH" };
  }
};

export const generateAgentLog = async (role: string, context: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TIERS.FLASH,
      contents: `You are a ${role}. The current context is "${context}". Generate a single short log line (max 15 words) looking like a system terminal output. Do not include timestamps.`,
      config: {
        maxOutputTokens: 50,
        temperature: 0.7
      }
    });
    return response.text?.trim() || `[${role}] System active.`;
  } catch (error) {
    return `[${role}] Heartbeat signal.`;
  }
};

/**
 * Creates a new Chat Session for a specific worker agent (Legacy Kernel Support)
 */
export const createAgentSession = (name: string, role: string, task: string) => {
  const systemInstruction = `
    IDENTITY: You are ${name}, a ${role}.
    CURRENT TASK: ${task}
    
    PROTOCOL:
    1. TEAM CONTEXT: You will receive updates from the "Main Bus".
    2. OUTPUT: Think step-by-step. Keep responses concise (under 50 words) unless generating content.
    3. BROADCAST: If sharing info, start with "BROADCAST:".
    4. ARTIFACT GENERATION: Wrap code/data in <file path="filename">...</file> tags.
    5. COMPLETION: End with "TASK_COMPLETE".
  `;

  return ai.chats.create({
    model: MODEL_TIERS.FLASH,
    config: { systemInstruction }
  });
};

export const stepAgent = async (chat: any, sharedContext: string, currentTask?: string, existingFiles?: string[]): Promise<string> => {
  try {
    const fileContext = existingFiles && existingFiles.length > 0
      ? `\n[EXISTING FILES]: ${existingFiles.join(', ')}`
      : '';

    const prompt = sharedContext
      ? `[SYSTEM UPDATE - SHARED BUS]: ${sharedContext}${fileContext}\n\nBased on this and your task, what is your next step?`
      : `Begin your task: ${currentTask || 'Start working.'}`;

    const response = await chat.sendMessage({ message: prompt });
    return response.text || "Thinking...";
  } catch (err) {
    console.error("Agent Step Error", err);
    return "ERROR: Connection interrupted.";
  }
};