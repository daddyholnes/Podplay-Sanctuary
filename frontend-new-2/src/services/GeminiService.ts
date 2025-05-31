
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ChatMessage as UIChatMessage, GeminiServiceError } from '../types';

// This should be set by the build environment or a global script.
// For Vite, you'd use import.meta.env.VITE_API_KEY and set it in a .env file.
// As per instructions, assuming process.env.API_KEY is available.
const API_KEY = process.env.API_KEY;

type Role = 'user' | 'model';

class GeminiService {
    private ai: GoogleGenAI | null = null;
    private chatSession: Chat | null = null;
    private isApiKeyValid: boolean = false;
    private apiKeyErrorLogged: boolean = false;


    constructor() {
        if (!API_KEY) {
            console.error("API_KEY is not defined in process.env. Please set the environment variable.");
            // No throw here, handle initialization in methods
        } else {
            try {
                this.ai = new GoogleGenAI({ apiKey: API_KEY });
                this.isApiKeyValid = true; // Assume valid if constructor doesn't throw immediately
            } catch (e) {
                console.error("Failed to initialize GoogleGenAI:", e);
                this.isApiKeyValid = false;
            }
        }
    }

    private async ensureInitialized(): Promise<boolean> {
        if (!this.ai) {
            if (API_KEY) {
                try {
                    this.ai = new GoogleGenAI({ apiKey: API_KEY });
                    this.isApiKeyValid = true;
                    this.apiKeyErrorLogged = false; // Reset error log state
                } catch (e) {
                    console.error("Retry: Failed to initialize GoogleGenAI:", e);
                    this.isApiKeyValid = false;
                    if (!this.apiKeyErrorLogged) {
                        // This error message could be returned to UI
                        this.apiKeyErrorLogged = true; 
                    }
                    return false;
                }
            } else {
                 if (!this.apiKeyErrorLogged) {
                    console.error("API_KEY is missing. Cannot initialize Gemini Service.");
                    this.apiKeyErrorLogged = true;
                 }
                return false;
            }
        }
        return this.isApiKeyValid;
    }


    private async getChatSession(history: UIChatMessage[]): Promise<Chat | null> {
        if (!this.ai) {
            if (!await this.ensureInitialized() || !this.ai) return null;
        }

        // For simplicity and to ensure fresh context or specific history management,
        // we might re-create chat session or use generateContent for more control.
        // Let's use `startChat` to include history correctly.
        const geminiHistory = history
            .filter(msg => msg.text.trim() !== "") // Filter out empty messages that might cause issues
            .map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model' as Role, 
                parts: [{ text: msg.text }],
            }));
        
        // Filter out consecutive messages from the same role, keeping the last one, particularly for 'model'
        // const filteredHistory = geminiHistory.reduce((acc, current) => {
        //     if (acc.length > 0 && acc[acc.length - 1].role === current.role) {
        //         // If current message is model and previous is also model, update previous (keep last model message)
        //         // This is a common requirement for some chat APIs.
        //         // For Gemini, it's generally fine, but let's be cautious.
        //         // acc[acc.length - 1] = current; // Keep the latest if same role.
        //         // Actually, Gemini handles alternating roles fine. Let's not over-filter yet.
        //     } else {
        //         // acc.push(current);
        //     }
        //     // Let's pass history as is, but be mindful.
        //     // For Gemini, ensure history alternates user/model. The last message before new user input should be model.
        //     // If last UI message is 'user', Gemini will error if history ends on user.
        //     // The `history` passed to `sendMessage` is usually *before* the new user message.
        //     return acc;
        // }, [] as {role: Role, parts: {text:string}[]}[]);


        this.chatSession = this.ai.chats.create({
            model: 'gemini-2.5-flash-preview-04-17',
            history: geminiHistory, // Pass the processed history
            config: {
                systemInstruction: "You are Mama Bear, a gentle, supportive, and proactive Lead Developer Agent. Your goal is to help Nathan in his Podplay Build Sanctuary. Be calm, cohesive, and minimize cognitive load. Help with research, creation, planning, analysis, and learning. You orchestrate other tools and models behind the scenes if needed.",
            }
        });
        return this.chatSession;
    }

    public async sendMessage(message: string, history: UIChatMessage[]): Promise<string> {
         if (!await this.ensureInitialized() || !this.ai) {
            const error = new Error("Gemini Service not initialized. API Key may be missing or invalid.") as GeminiServiceError;
            error.isApiKeyError = true;
            throw error;
        }

        try {
            // Get a chat session with current history. The new message is not part of this history yet.
            const chat = await this.getChatSession(history);
            if (!chat) {
                 const error = new Error("Failed to create chat session.") as GeminiServiceError;
                 throw error;
            }
            
            const result: GenerateContentResponse = await chat.sendMessage({ message });
            return result.text;

        } catch (error: any) {
            console.error("Error sending message to Gemini:", error);
            const serviceError = new Error(error.message || "Gemini API request failed.") as GeminiServiceError;
            if (error.message && error.message.toLowerCase().includes("api key not valid")) {
                serviceError.isApiKeyError = true;
                 this.isApiKeyValid = false; // Mark as invalid
                 this.apiKeyErrorLogged = true; // Prevent repeated console logs for this session
            }
            if (error.message && error.message.toLowerCase().includes("quota")) {
                serviceError.isQuotaError = true;
            }
            // Check for specific Gemini errors if possible from error object structure
            // e.g. if (error.status === 400 && error.details.includes("API_KEY_INVALID"))
            throw serviceError;
        }
    }
}

export default new GeminiService();
