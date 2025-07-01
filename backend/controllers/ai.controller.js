import {GoogleGenAI} from "@google/genai";
import Member from "../models/member.model.js";
export const getAiSuggestions = async (req, res) => {
    try {
        const {member} = req.body;
        if(!member){
            return res.status(400).json({ message: "Member is required" });
        }
        const ai = new GoogleGenAI({});
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Make it feel personalized with name and referencing little of theri details. You now have to give suggestions on the basis of the data that i will share with you which is of one of our members. You will get data like name,age,gender theri health metrics theri body measurements their workout routine and some notes about them. You have to give some suggestion to improve them
                Analyse the following JSON describing a gym member and provide 3-4 concise, actionable tips.
                Categorise each tip as "Workout", "Nutrition", or "General".
                Respond strictly in JSON:
                { "suggestions": [ { "category": "...", "tip": "..." } ] }

    Member JSON:
            ${JSON.stringify(member,null,2)}
            `,
        });
        let cleaned = response.text.trim();

        // Check if Gemini wrapped it in ```json ... ``` or ``` ... ```
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/```json|```/g, '').trim();
        }
  
        const parsed = JSON.parse(cleaned);
   
        res.status(200).json({ 
            success: true,
            suggestions: parsed.suggestions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}