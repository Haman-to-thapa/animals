import { Request, Response } from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const getAIHelpResponse = async (req: Request, res: Response) => {
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
    } catch (error: any) {
        console.error('Groq AI Error:', error);
        res.status(500).json({
            error: 'Failed to fetch AI response',
            details: error.message
        });
    }
};
