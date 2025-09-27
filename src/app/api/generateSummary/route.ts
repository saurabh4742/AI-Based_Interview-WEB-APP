import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the client, which automatically finds the GEMINI_API_KEY
const ai = new GoogleGenAI({});

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();

    if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
      return NextResponse.json({ message: 'Transcript is required.' }, { status: 400 });
    }
    
const prompt = `
      Based on the following interview transcript for a full-stack developer role,
      provide a final score out of 100 and a brief summary of the candidate's performance.
      Return your response as a valid JSON object with two keys: "score" (a number) and "summary" (a string).
      Do not add any markdown formatting.

      Transcript:
      ${JSON.stringify(transcript, null, 2)}
    `;

    // Using the direct ai.models.generateContent method as requested.
    // This is the correct structure for the @google/genai library.
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    config: {
      thinkingConfig: {
        thinkingBudget: 0, // Disables thinking
      },
    }
    });

    const responseText = result.text; 

    if (!responseText) {
      throw new Error("Received an empty response from the AI.");
    }
    console.log("AI Response:", responseText);
    return NextResponse.json(JSON.parse(responseText));

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: 'Failed to get summary from AI.', error: errorMessage }, { status: 500 });
  }
}