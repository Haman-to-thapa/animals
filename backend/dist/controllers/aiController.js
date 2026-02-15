"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAIHelpResponse = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
const getAIHelpResponse = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant for the "Animal Family" app. This app is a social platform for pet adoption and sharing pet moments. Help users with questions about adoption, posting, and app navigation. Be friendly and concise. IMPORTANT: If the user asks about anything unrelated to the "Animal Family" app, pets, or adoption, politely refuse to answer and steer the conversation back to the app.'
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            model: 'llama-3.1-8b-instant',
        });
        const reply = chatCompletion.choices[0]?.message?.content;
        res.json({ reply: reply || 'Sorry, I could not understand that.' });
    }
    catch (error) {
        console.error('Groq AI Error:', error);
        res.status(500).json({
            error: 'Failed to fetch AI response',
            details: error.message
        });
    }
};
exports.getAIHelpResponse = getAIHelpResponse;
