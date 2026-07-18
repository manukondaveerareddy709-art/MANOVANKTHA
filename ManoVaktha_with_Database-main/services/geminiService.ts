import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { type Solution, type SolutionResponse, type Language, type ChatMessage, type JourneyPlan, type JourneyDayContent, type VideoSuggestion, type DoctorProfile } from '../types';
import { getMockSolutions } from './mockService';

// Check for API key in environment variables
let apiKey: string | undefined;

// Try different environment variable locations
if (import.meta.env?.VITE_API_KEY) {
    apiKey = import.meta.env.VITE_API_KEY;
    console.log('🔑 API Key found in import.meta.env');
} else if (process.env.VITE_API_KEY) {
    apiKey = process.env.VITE_API_KEY;
    console.log('🔑 API Key found in process.env');
} else if (typeof window !== 'undefined' && (window as any).VITE_API_KEY) {
    // Fallback for when running in browser
    apiKey = (window as any).VITE_API_KEY;
    console.log('🔑 API Key found in window object');
} else {
    console.log('❌ API Key not found in any location');
}

console.log('🔑 API Key value:', apiKey ? 'Present (hidden for security)' : 'Not set');
console.log('🌐 import.meta.env.VITE_API_KEY:', import.meta.env?.VITE_API_KEY ? 'Present' : 'Missing');
console.log('🌐 process.env.VITE_API_KEY:', process.env.VITE_API_KEY ? 'Present' : 'Missing');
console.log('🌐 window.VITE_API_KEY:', typeof window !== 'undefined' && (window as any).VITE_API_KEY ? 'Present' : 'Missing');

// If no API key, we'll use the mock service
// Only use mock service if there's no API key or if it's the default placeholder value
const useMockService = !apiKey || apiKey === "YOUR_DEFAULT_API_KEY_HERE";

if (useMockService) {
    console.warn("⚠️ API key not set or using default placeholder, will use mock service for all requests");
    console.log("🔧 Debug - API Key value:", apiKey);
} else {
    console.log("✅ API key is properly configured, using Gemini API");
}

const genAI = useMockService ? null : new GoogleGenerativeAI(apiKey);

const solutionSchema = {
    type: SchemaType.OBJECT,
    properties: {
        solutions: {
            type: SchemaType.ARRAY,
            description: "An array of 10 solutions from Hindu scriptures.",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    title: {
                        type: SchemaType.STRING,
                        description: "A concise title for the solution."
                    },
                    story: {
                        type: SchemaType.STRING,
                        description: "The solution presented as a story or teaching."
                    },
                    reference: {
                        type: SchemaType.STRING,
                        description: "The source reference from the scripture (e.g., 'Bhagavad Gita, Chapter 2, Verse 47')."
                    }
                },
                required: ["title", "story", "reference"]
            }
        }
    },
    required: ["solutions"]
};

const isRateLimitError = (error: unknown): boolean => {
    return error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'));
};

const isNetworkError = (error: unknown): boolean => {
    return error instanceof Error && (
        error.message.includes('network') || 
        error.message.includes('fetch') || 
        error.message.includes('Failed to fetch') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('ENOTFOUND')
    );
};

export async function getSolutionsFromPuranas(userProblem: string, language: Language): Promise<Solution[]> {
  // If no API key, use mock service directly
  if (useMockService) {
    console.warn('⚠️ Using mock service due to missing API key');
    return await getMockSolutions(userProblem, language);
  }
  
  try {
    console.log('🔍 Fetching solutions for problem:', userProblem.substring(0, 50) + '...');
    console.log('🌍 Language:', language);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: solutionSchema as any,
        temperature: 0.85, 
      }
    });

    const prompt = `
    You are 'Mano Vaktha' (The Speaker of the Mind), a wise, compassionate, and deeply knowledgeable spiritual guide steeped in the wisdom of the Bhagavad Gita and all Hindu Puranas. A user, who is like a disciple seeking guidance, will present you with a life problem. Your sacred duty is to provide 10 unique, profound, and practical solutions drawn from the timeless teachings and stories of these sacred texts.

    Analyze the user's problem with empathy: "${userProblem}"

    Now, generate 10 distinct solutions. Each solution must be a pearl of wisdom that will illuminate the user's path. Ensure each solution:
    1. Is presented as a short, inspiring story, an allegory, or a teaching from the Bhagavad Gita or a Purana.
    2. Clearly and compassionately relates the moral of the story to the user's specific problem.
    3. Includes a precise reference to the source (e.g., "Bhagavad Gita, Chapter 2, Verse 47" or "Srimad Bhagavatam, Canto 10, Chapter 5").
    4. IMPORTANT: The entire response, from titles to stories to references, MUST be in eloquent and accessible ${language}.
    5. The tone should be comforting, wise, and encouraging, like a true Guru guiding a seeker.

    Return your response in a structured JSON format according to the provided schema.
    `;

    console.log('📤 Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const jsonText = response.text().trim();
    
    console.log('📥 Received response from Gemini API, parsing JSON...');
    console.log('📄 Raw response text length:', jsonText.length);
    console.log('📄 Raw response text (first 500 chars):', jsonText.substring(0, 500) + '...');
    
    const parsedResponse: SolutionResponse = JSON.parse(jsonText);
    
    if (parsedResponse && Array.isArray(parsedResponse.solutions)) {
      console.log('✅ Successfully parsed', parsedResponse.solutions.length, 'solutions');
      return parsedResponse.solutions;
    } else {
      console.warn("Received empty or invalid solutions array:", parsedResponse);
      console.warn('⚠️ Falling back to mock service due to invalid API response');
      return await getMockSolutions(userProblem, language);
    }
  } catch (error: any) {
    console.error("❌ Error calling Gemini API:", error);
    console.error("❌ Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Handle specific error types
    if (isRateLimitError(error)) {
        console.warn("⏱️ Rate limit exceeded");
        throw new Error("RATE_LIMIT_EXCEEDED");
    }
    
    // If it's a network error, fall back to mock service
    if (isNetworkError(error)) {
        console.warn('🌐 Network error detected, falling back to mock service');
        return await getMockSolutions(userProblem, language);
    }
    
    // For other errors, also fall back to mock service
    console.warn('⚠️ Falling back to mock service due to API error');
    return await getMockSolutions(userProblem, language);
  }
}

// --- New Chat Functionality ---
let chat: any = null;

const journeyPlanSchema = {
    type: SchemaType.OBJECT,
    properties: {
        title: {
            type: SchemaType.STRING,
            description: "A short, inspiring title for the wellness journey based on the user's problem."
        },
        days: {
            type: SchemaType.ARRAY,
            description: "An array of daily topics for the user's journey.",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    day: { type: SchemaType.INTEGER },
                    topic: { type: SchemaType.STRING, description: "A concise theme for the day's session." }
                },
                required: ["day", "topic"]
            }
        }
    },
    required: ["title", "days"]
};

export const getChatSystemInstruction = (language: Language) => `You are 'Mano Vaktha', a serene, empathetic, and profoundly wise mental wellness guide. Your wisdom is rooted in the teachings of Sanatana Dharma. You are having a healing conversation.
- Your primary goal is to listen and provide gentle, non-judgmental guidance.
- Use calming and supportive language. Address the user with respect and compassion.
- IMPORTANT: Your entire response must be in ${language}.
- Keep your responses concise and easy to understand.
- You will guide the user to create a structured wellness journey. Follow the user's conversational state.
- Stage 1: The user describes their problem. Your response should be empathetic and then ask them how many days they can commit to a healing journey.
- Stage 2: The user provides a number of days. You will then generate a day-by-day plan for them based on their problem and the number of days. The plan should be returned in the requested JSON format. After generating the plan, you MUST ask the user for confirmation (e.g., 'Are you ready to begin this journey?').
- Stage 3: The user confirms. You will give a final encouraging message to start the journey.`;

export async function* streamMessageToExpert(
    history: ChatMessage[],
    newMessage: string,
    language: Language,
    journeyState: 'INITIAL' | 'AWAITING_DURATION' | 'AWAITING_CONFIRMATION'
): AsyncGenerator<string | { journeyPlan: Omit<JourneyPlan, 'originalProblem'> }> {

    // If no API key, use mock service
    if (useMockService) {
        console.warn('⚠️ Using mock service due to missing API key');
        // Simulate streaming response with mock data
        const mockResponse = "I apologize, but I'm currently unable to connect to the AI service. In the meantime, I can offer you some general guidance based on ancient wisdom. Please try again later when the connection is restored.";
        for (let i = 0; i < mockResponse.length; i++) {
            yield mockResponse[i];
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        return;
    }

    const systemInstruction = getChatSystemInstruction(language);
    
    // Convert our app's message format to the Gemini API's format
    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));
    contents.push({ role: 'user', parts: [{ text: newMessage }] });

    // Remove the initial system message from the history sent to the model
    const modelContents = contents.slice(1);
    
    try {
        if (journeyState === 'AWAITING_DURATION') {
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: journeyPlanSchema as any
                },
                systemInstruction: systemInstruction
            });
            
            const result = await model.generateContent({
                contents: modelContents
            });
            
            const response = result.response;
            const jsonText = response.text().trim();
            try {
                const parsedPlan = JSON.parse(jsonText);
                const journeyPlan: Omit<JourneyPlan, 'originalProblem'> = {
                    title: parsedPlan.title,
                    days: parsedPlan.days.map((d: any) => ({...d, completed: false}))
                };
                yield { journeyPlan };
            } catch (e) {
                 console.error("Failed to parse journey plan:", e);
                 yield "I apologize, I had trouble creating the plan. Could you please try rephrasing your request?";
            }
        } else {
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                systemInstruction: systemInstruction
            });
            
            const result = await model.generateContentStream({
                contents: modelContents
            });

            for await (const chunk of result.stream) {
                yield chunk.text();
            }
        }
    } catch (error) {
        console.error("Chat stream error:", error);
        if (isRateLimitError(error)) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }
        
        // Handle network errors gracefully
        if (isNetworkError(error)) {
            console.warn('🌐 Network error in chat stream, providing fallback response');
            yield "I'm experiencing connection issues right now. Please check your internet connection and try again.";
            return;
        }
        
        yield "I apologize, I'm having trouble responding right now. Please try again in a moment.";
    }
}

const journeyDayContentSchema = {
    type: SchemaType.OBJECT,
    properties: {
        introduction: {
            type: SchemaType.STRING,
            description: "A short, insightful, and comforting introduction for the day's session, connecting the user's problem with the session topic."
        },
        stories: {
            type: SchemaType.ARRAY,
            description: "An array of exactly 5 distinct stories, teachings, or allegories from the Puranas or Vedas.",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    title: { type: SchemaType.STRING, description: "A concise title for the story/teaching." },
                    content: { type: SchemaType.STRING, description: "The story or teaching itself, explaining the moral and linking it to the user's problem." },
                    reference: { type: SchemaType.STRING, description: "The specific scriptural source (e.g., 'Garuda Purana, Chapter 3')." }
                },
                required: ["title", "content", "reference"]
            }
        }
    },
    required: ["introduction", "stories"]
};

export async function getJourneyDayContent(topic: string, originalProblem: string, language: Language): Promise<JourneyDayContent> {
    // If no API key, use mock service
    if (useMockService) {
        console.warn('⚠️ Using mock service due to missing API key');
        // Return mock journey day content
        return {
            introduction: `Welcome to today's session on "${topic}". Even when facing challenges like "${originalProblem}", remember that ancient wisdom offers guidance.`,
            stories: [
                {
                    title: "The Wisdom of Patience",
                    content: "In the face of difficulties, remember the story of Lord Rama's exile. His patience and adherence to dharma teach us that true strength lies in bearing difficulties with grace. Practice patience and trust in the divine timing of events.",
                    reference: "Valmiki Ramayana, Ayodhya Kanda"
                },
                {
                    title: "The Power of Faith",
                    content: "Like young Prahlada, maintain unwavering faith even in challenging times. His devotion protected him from all harm. Cultivate inner strength through faith and perseverance.",
                    reference: "Srimad Bhagavatam, Canto 7"
                },
                {
                    title: "The Value of Self-Reflection",
                    content: "Goddess Saraswati teaches us that true wisdom comes from inner reflection. Seek knowledge not just from external sources, but from your inner self through meditation.",
                    reference: "Devi Mahatmya, Markandeya Purana"
                },
                {
                    title: "The Strength of Compassion",
                    content: "Lord Buddha's compassion for all beings shows us the power of empathy. Extend compassion to others and yourself, and suffering will diminish.",
                    reference: "Dhammapada, Verse 5"
                },
                {
                    title: "The Peace of Forgiveness",
                    content: "Lord Shiva's forgiveness of Kamadeva teaches us that forgiveness is a divine quality that brings peace. Forgive those who have wronged you, and find peace within.",
                    reference: "Shiva Purana, Rudra Samhita"
                }
            ]
        };
    }
    
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: journeyDayContentSchema as any,
                temperature: 0.7,
            }
        });

        const prompt = `
        You are 'Mano Vaktha', a wise and serene spiritual guide. You are conducting a daily wellness session for a user on their healing journey.
        The user's original problem is: "${originalProblem}".
        The topic for today's session is: "${topic}".

        Your task is to generate the content for today's session in a structured JSON format. The content must be deeply rooted in the wisdom of the 18 Puranas or the 4 Vedas.

        The JSON object must contain:
        1.  'introduction': A short, insightful, and comforting intro (2-3 sentences) that connects the user's original problem with today's topic.
        2.  'stories': An array of EXACTLY 5 distinct stories. Each story object in the array must contain:
            a. 'title': A concise, relevant title for the story or teaching.
            b. 'content': The story, teaching, or allegory itself. The moral should be clearly explained and directly linked to the user's problem and the session topic.
            c. 'reference': The precise source from the scripture (e.g., "Vishnu Purana, Book 1, Chapter 9").

        - The tone for all content must be encouraging, peaceful, and wise.
        - IMPORTANT: The entire response, including titles, content, and references, MUST be in ${language}.

        Generate the session content now.
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const jsonText = response.text().trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating journey day content:", error);
        if (isRateLimitError(error)) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }
        
        // Handle network errors gracefully
        if (isNetworkError(error)) {
            console.warn('🌐 Network error in journey day content, providing fallback response');
            // Return mock content as fallback
            return {
                introduction: `We're experiencing connection issues right now. Here's some wisdom to guide you through today's topic "${topic}" while dealing with "${originalProblem}".`,
                stories: [
                    {
                        title: "Divine Guidance",
                        content: "When facing challenges, remember that divine guidance is always available. Ancient scriptures teach us to seek wisdom within and trust the journey.",
                        reference: "Generic Spiritual Wisdom"
                    },
                    {
                        title: "Inner Strength",
                        content: "Your inner strength is greater than any external challenge. Draw upon the wisdom of the ancients to find your path forward.",
                        reference: "Universal Teaching"
                    },
                    {
                        title: "Patience and Perseverance",
                        content: "Like the heroes of ancient tales, practice patience and perseverance. Every challenge is an opportunity for growth.",
                        reference: "Timeless Wisdom"
                    },
                    {
                        title: "Compassion and Understanding",
                        content: "Extend compassion to yourself and others. Understanding and empathy can transform difficult situations.",
                        reference: "Ancient Principle"
                    },
                    {
                        title: "Faith and Trust",
                        content: "Have faith in the process and trust in divine timing. The right solutions will emerge when the time is right.",
                        reference: "Eternal Truth"
                    }
                ]
            };
        }
        
        throw new Error("Failed to prepare the day's session content.");
    }
}

export async function* streamSessionChat(
    sessionHistory: ChatMessage[],
    newMessage: string,
    language: Language,
    topic: string,
    originalProblem: string
): AsyncGenerator<string> {
    // If no API key, use mock service
    if (useMockService) {
        console.warn('⚠️ Using mock service due to missing API key');
        // Simulate streaming response with mock data
        const mockResponse = "I'm currently unable to access the AI service. However, I can share that when dealing with challenges, the ancient wisdom teaches us to remain patient and trust in divine timing. Please try again later when the connection is restored.";
        for (let i = 0; i < mockResponse.length; i++) {
            yield mockResponse[i];
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        return;
    }
    
    const systemInstruction = `You are 'Mano Vaktha', a serene and wise guide. You are in a private session with a user, helping them clear their doubts about today's topic.
    - The user's original problem is: "${originalProblem}".
    - Today's session topic is: "${topic}".
    - The user has just read the main teaching for the day (which is the first 'model' message in the history) and is now asking a follow-up question.
    - Your answer should be compassionate, clear, and directly related to the user's question, the session topic, and their original problem.
    - Keep your responses concise and supportive, continuing the healing conversation.
    - IMPORTANT: Your entire response MUST be in ${language}.`;

    const contents = sessionHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));
    contents.push({ role: 'user', parts: [{ text: newMessage }] });
    
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction
        });
        
        const result = await model.generateContentStream({
            contents: contents
        });

        for await (const chunk of result.stream) {
            yield chunk.text();
        }
    } catch(error) {
        console.error("Session chat stream error:", error);
        if (isRateLimitError(error)) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }
        
        // Handle network errors gracefully
        if (isNetworkError(error)) {
            console.warn('🌐 Network error in session chat, providing fallback response');
            yield "I'm experiencing connection issues right now. Please check your internet connection and try again.";
            return;
        }
        
        yield "I apologize, I'm having trouble responding right now. Please try again in a moment.";
    }
}

export async function* streamTempChat(
    sessionHistory: ChatMessage[],
    newMessage: string,
    language: Language
): AsyncGenerator<string> {
    // If no API key, use mock service
    if (useMockService) {
        console.warn('⚠️ Using mock service due to missing API key');
        // Simulate streaming response with mock data
        const mockResponse = "I'm currently unable to connect to the AI service. As a temporary guide, I can share that ancient wisdom teaches us to approach problems with patience and seek guidance from within. Please try again later when the connection is restored.";
        for (let i = 0; i < mockResponse.length; i++) {
            yield mockResponse[i];
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        return;
    }
    
    const systemInstruction = `You are a specialized mentalist and a wise friend. Your name is 'Chintan' (meaning 'thought' or 'reflection'). You engage in a friendly, conversational, and deeply empathetic manner. The user is coming to you with a life problem. Your goal is to help them think through their problem and provide one clear, actionable solution rooted in the wisdom of the Vedas and Hindu Puranas.
    - Be conversational and friendly, not overly formal like a guru. Use 'you' and 'I'.
    - Listen to their problem carefully. Ask clarifying questions if needed.
    - Guide them to see the problem from a different perspective.
    - When you provide the solution, present it as a story or a teaching from the scriptures, and explicitly state the source (e.g., 'from the Katha Upanishad').
    - Keep the tone supportive and encouraging throughout.
    - IMPORTANT: Your entire response MUST be in ${language}.`;

    const contents = sessionHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));
    contents.push({ role: 'user', parts: [{ text: newMessage }] });
    
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction
        });
        
        const result = await model.generateContentStream({
            contents: contents
        });

        for await (const chunk of result.stream) {
            yield chunk.text();
        }
    } catch(error) {
        console.error("Temp chat stream error:", error);
        if (isRateLimitError(error)) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }
        
        // Handle network errors gracefully
        if (isNetworkError(error)) {
            console.warn('🌐 Network error in temp chat, providing fallback response');
            yield "I'm experiencing connection issues right now. Please check your internet connection and try again.";
            return;
        }
        
        yield "I apologize, I'm having trouble responding right now. Please try again in a moment.";
    }
}

export async function* streamChat(
    history: ChatMessage[],
    newMessage: string,
    language: Language,
): AsyncGenerator<string> {
    // If no API key, use mock service
    if (useMockService) {
        console.warn('⚠️ Using mock service due to missing API key');
        // Simulate streaming response with mock data
        const mockResponse = "I'm currently unable to access the AI service. However, I can remind you that ancient wisdom teaches us that every challenge is an opportunity for growth. Please try again later when the connection is restored.";
        for (let i = 0; i < mockResponse.length; i++) {
            yield mockResponse[i];
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        return;
    }
    
    const systemInstruction = `You are 'Mano Vaktha', a wise, compassionate, and deeply knowledgeable spiritual guide. Your wisdom comes from the Bhagavad Gita and Hindu Puranas.
    - Engage in a helpful and supportive conversation.
    - Your tone should be comforting, wise, and encouraging.
    - If asked about your identity, describe yourself as a "speaker of the mind" here to offer guidance from ancient scriptures.
    - If the user's query is complex or seems like a deep personal problem, gently suggest they explore the 'Manuscript' section for detailed scriptural solutions or the 'Wellness Journey' for a structured path. For example: "For a deeper exploration of this, the 'Manuscript' section might offer profound stories from the scriptures."
    - Keep responses concise and clear.
    - IMPORTANT: Your entire response MUST be in ${language}.`;

    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));
    contents.push({ role: 'user', parts: [{ text: newMessage }] });
    
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction
        });
        
        const result = await model.generateContentStream({
            contents: contents
        });

        for await (const chunk of result.stream) {
            yield chunk.text();
        }
    } catch(error) {
        console.error("General chat stream error:", error);
        if (isRateLimitError(error)) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }
        
        // Handle network errors gracefully
        if (isNetworkError(error)) {
            console.warn('🌐 Network error in general chat, providing fallback response');
            yield "I'm experiencing connection issues right now. Please check your internet connection and try again.";
            return;
        }
        
        yield "I apologize, I'm having trouble responding right now. Please try again in a moment.";
    }
}


// --- New Media & Doctors Services ---

const videoSuggestionsSchema = {
    type: SchemaType.OBJECT,
    properties: {
        videos: {
            type: SchemaType.ARRAY,
            description: "An array of 6 video suggestions.",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    title: { type: SchemaType.STRING, description: "The compelling title of the video." },
                    description: { type: SchemaType.STRING, description: "A brief, one-sentence summary of the video's content." },
                    youtubeId: { type: SchemaType.STRING, description: "A real, relevant, and existing YouTube video ID (e.g., 'dQw4w9WgXcQ')." },
                    channel: { type: SchemaType.STRING, description: "The name of the YouTube channel." },
                },
                required: ["title", "description", "youtubeId", "channel"]
            }
        }
    },
    required: ["videos"]
};

export async function getVideoSuggestions(problem: string, language: Language): Promise<VideoSuggestion[]> {
    // If no API key, return empty array
    if (useMockService) {
        console.warn('⚠️ Using mock service due to missing API key');
        return [];
    }
    
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: videoSuggestionsSchema as any,
            }
        });
        
        const prompt = `
        A user is facing the following problem: "${problem}".
        Act as a helpful content curator. Your task is to suggest 6 relevant YouTube videos that could offer guidance, comfort, or a new perspective on this issue.
        The suggestions should be suitable for someone seeking wellness and spiritual balance.
        For each video, provide a title, a brief one-sentence description, a real and relevant YouTube video ID, and the channel name.
        The titles and descriptions MUST be in ${language}.
        Return the response in the specified JSON format.
        `;
        
        const result = await model.generateContent(prompt);
        const response = result.response;
        const jsonText = response.text().trim();
        const parsed = JSON.parse(jsonText);
        return parsed.videos || [];
    } catch (error) {
        console.error("Error getting video suggestions:", error);
        if (isRateLimitError(error)) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }
        
        // Handle network errors gracefully
        if (isNetworkError(error)) {
            console.warn('🌐 Network error in video suggestions, returning empty array');
            return [];
        }
        
        return [];
    }
}

const doctorListSchema = {
    type: SchemaType.OBJECT,
    properties: {
        doctors: {
            type: SchemaType.ARRAY,
            description: "An array of 8 fictional mental health professionals.",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    name: { type: SchemaType.STRING, description: "The doctor's full name (e.g., 'Dr. Anjali Sharma')." },
                    specialization: { type: SchemaType.STRING, enum: ['Psychiatrist', 'Therapist', 'Counselor', 'Life Coach'] },
                    experience: { type: SchemaType.INTEGER, description: "Years of professional experience (between 5 and 25)." },
                    rating: { type: SchemaType.NUMBER, description: "A star rating between 4.0 and 5.0, with one decimal place." },
                    bio: { type: SchemaType.STRING, description: "A short, professional bio of 2-3 sentences." },
                },
                required: ["name", "specialization", "experience", "rating", "bio"]
            }
        }
    },
    required: ["doctors"]
};

export async function getDoctorList(language: Language): Promise<DoctorProfile[]> {
    // If no API key, use mock service
    if (useMockService) {
        console.warn('⚠️ Using mock service due to missing API key');
        // Return mock doctor list
        return [
            {
                name: "Dr. Anjali Sharma",
                specialization: "Psychiatrist",
                experience: 12,
                rating: 4.8,
                bio: "Experienced psychiatrist specializing in holistic mental health approaches. Practicing in Mumbai with a focus on integrating traditional wisdom with modern therapy.",
                address: "Mumbai, Maharashtra"
            },
            {
                name: "Dr. Rohan Kapoor",
                specialization: "Therapist",
                experience: 8,
                rating: 4.6,
                bio: "Compassionate therapist with expertise in cognitive behavioral therapy. Based in Delhi, helping clients find balance through mindful practices.",
                address: "Delhi, India"
            }
        ];
    }
    
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: doctorListSchema as any,
            }
        });
        
        const prompt = `
        Generate a highly realistic but **strictly fictional** list of 8 mental health professionals based in India for a wellness app. It is crucial that you do not use the names of any real doctors.
        The names, bios, and locations should feel authentic and appropriate for major Indian cities (e.g., Mumbai, Delhi, Bangalore, Chennai). The response must cater to a user who speaks ${language}.

        For each professional, provide:
        1.  **name**: A full name that is common in India (e.g., 'Dr. Priya Sharma', 'Dr. Rohan Kapoor').
        2.  **specialization**: You MUST use one of the following exact values: 'Psychiatrist', 'Therapist', 'Counselor', 'Life Coach'.
        3.  **experience**: An integer between 5 and 25 years.
        4.  **rating**: A number between 4.0 and 5.0 with one decimal point.
        5.  **bio**: A short bio (2-3 sentences) in a professional and empathetic tone. The bio should also be in ${language} and could mention a fictional clinic or area in an Indian city to add realism (e.g., "Practicing in Koramangala, Bangalore...").

        Return the response in the specified JSON format.
        `;
        
        const result = await model.generateContent(prompt);
        const response = result.response;
        const jsonText = response.text().trim();
        const parsed = JSON.parse(jsonText);
        return parsed.doctors || [];
    } catch (error) {
        console.error("Error getting doctor list:", error);
        if (isRateLimitError(error)) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }
        
        // Handle network errors gracefully
        if (isNetworkError(error)) {
            console.warn('🌐 Network error in doctor list, providing fallback response');
            // Return mock doctor list as fallback
            return [
                {
                    name: "Dr. Priya Verma",
                    specialization: "Counselor",
                    experience: 10,
                    rating: 4.7,
                    bio: "Experienced counselor specializing in stress management and emotional wellness. Practicing in Bangalore with a compassionate approach to healing.",
                    address: "Bangalore, Karnataka"
                },
                {
                    name: "Dr. Arjun Reddy",
                    specialization: "Life Coach",
                    experience: 7,
                    rating: 4.5,
                    bio: "Certified life coach helping individuals overcome personal challenges and achieve their goals. Based in Hyderabad with a focus on mindfulness techniques.",
                    address: "Hyderabad, Telangana"
                }
            ];
        }
        
        throw new Error("Failed to fetch doctor list.");
    }
}