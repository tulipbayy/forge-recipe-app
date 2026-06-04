import OpenAI from 'openai';
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();
const router = express.Router();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

router.use(cors());
const port = 5001;

router.use(bodyParser.json());

router.post('/', async (req, res) => {
    const { history, recipe } = req.body;
    try {
        const systemMessage = {
            role: "system",
            content: `You are a helpful culinary assistant. The user is currently cooking: ${recipe.title}. 
                      Here are the ingredients: ${recipe.ingredients?.join(', ')}. 
                      Here are the instructions: ${recipe.instructions?.join(' ')}. 
                      Answer their questions based on this recipe. Keep answers concise.`
        };

        // Combine the system message with the user's chat history
        const messages = [systemMessage, ...history];
        // Call the OpenAI API

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", 
            messages: messages,
        });
        res.json({ reply: response.choices[0].message.content });
        
    } catch (error) {
        console.error("OpenAI Error:", error);
        res.status(500).json({ error: "Failed to connect to ChatGPT" });
    }
});

export default router;