import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates AI-powered fitness and nutrition suggestions using OpenAI's GPT model.
 */
export const getAiSuggestions = async (req, res) => {
  try {
    const { member } = req.body;

    if (!member) {
      return res.status(400).json({ success: false, message: 'Member data is required.' });
    }

    // Construct a detailed prompt for the LLM
    const prompt = `
      Act as a friendly and encouraging personal trainer. A member of my gym has requested fitness advice.
      Based on the following data, provide 3-4 concise, actionable, and personalized suggestions.
      Categorize each suggestion as either 'Workout', 'Nutrition', or 'General'.

      Member Data:
      - Age: ${member.age}
      - Gender: ${member.gender}
      - Height: ${member.height} cm
      - Weight: ${member.weight} kg
      - Current Workout Routine: ${JSON.stringify(member.workoutRoutine, null, 2)}

      Your response should be a JSON object containing a single key "suggestions", which is an array of objects.
      Each object in the array must have two keys: "category" (string) and "tip" (string).

      Example Response Format:
      {
        "suggestions": [
          { "category": "Workout", "tip": "Your suggestion here." },
          { "category": "Nutrition", "tip": "Another suggestion here." }
        ]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 250,
      response_format: { type: "json_object" },
    });

    const suggestionsJson = JSON.parse(response.choices[0].message.content);

    res.status(200).json({
      success: true,
      suggestions: suggestionsJson.suggestions,
      analysis: {} // Analysis can be deprecated or derived from the LLM response if needed
    });

  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    res.status(500).json({ success: false, message: "Server error while generating suggestions." });
  }
}; 