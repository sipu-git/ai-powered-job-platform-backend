import { GoogleGenerativeAI } from "@google/generative-ai";

if(!process.env.GENERATIVE_AI){
    console.warn("Geminini AI setup failed!");
}
export const generativeAi = new GoogleGenerativeAI(process.env.GENERATIVE_AI || "");
