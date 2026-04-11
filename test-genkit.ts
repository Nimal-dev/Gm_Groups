import { ai } from './src/ai/genkit';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
    try {
        console.log("Testing Genkit AI Generation...");
        const response = await ai.generate({
            prompt: "Say hello",
        });
        console.log("Response:", response.text);
    } catch (e) {
        console.error("Genkit Error Detailed:", e);
    }
}

test();
