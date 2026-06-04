import OpenAI from 'openai';
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import rateLimit from 'express-rate-limit';

dotenv.config();
const router = express.Router();

router.use(cors());
const port = 5001;

router.use(bodyParser.json());

// to limit amount of questions user can ask the assistant
const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Limit each user to 5 requests per minute
    message: { error: "You are sending too many chats! Please wait a minute." }
});

function buildFallbackReply(history = [], recipe = {}) {
    const lastMessage = history.at(-1)?.content?.toLowerCase() || "";
    const title = recipe.title || "this recipe";
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];

    if (lastMessage.includes("substitute") || lastMessage.includes("swap")) {
        return `For ${title}, you can usually swap ingredients with similar texture and flavor. If you tell me the exact ingredient, I can suggest a closer replacement.`;
    }

    if (lastMessage.includes("ingredient")) {
        return ingredients.length
            ? `${title} uses: ${ingredients.join(", ")}.`
            : `I do not see ingredients listed for ${title} yet.`;
    }

    if (lastMessage.includes("instruction") || lastMessage.includes("step") || lastMessage.includes("how")) {
        return instructions.length
            ? `Start with this step: ${instructions[0]}`
            : `I do not see instructions listed for ${title} yet.`;
    }

    if (lastMessage.includes("time") || lastMessage.includes("long")) {
        return `I do not have an exact cook time for ${title}, but follow the recipe steps and check doneness as you go.`;
    }

    return `I can help with ${title}. Ask me about ingredients, substitutions, instructions, or cooking tips.`;
}

router.post('/', chatLimiter, async (req, res) => {
    const { history, recipe } = req.body;
    if (!process.env.OPENAI_API_KEY) {
        return res.json({ reply: buildFallbackReply(history, recipe) });
    }

    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

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
            model: process.env.OPENAI_MODEL || "gpt-4o-mini", 
            messages: messages,
        });
        res.json({ reply: response.choices[0].message.content });
        
    } catch (error) {
        console.error("OpenAI Error:", error);
        res.json({ reply: buildFallbackReply(history, recipe) });
    }
});

export default router;
