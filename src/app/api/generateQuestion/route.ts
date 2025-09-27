import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({});

export async function POST(req: NextRequest) {
  try {
    // const { difficulty, history } = await req.json();

    // if (!difficulty) {
    //   return NextResponse.json({ message: 'Difficulty level is required.' }, { status: 400 });
    // }

    // const historyText = Array.isArray(history) && history.length > 0
    //   ? `Do not repeat any of these previous questions: ${history.join(', ')}`
    //   : 'This is the first question.';

    const prompt = `
    Generate a set of 6 unique interview questions for a full-stack developer role.
      The set must contain exactly:
      - 2 "Easy" difficulty questions.
      - 2 "Medium" difficulty questions.
      - 2 "Hard" difficulty questions.
      Return the response as a single, valid JSON array of objects.
      Each object in the array must have two keys: "text" (the question string) and "difficulty" (a string: "Easy", "Medium", or "Hard").
      The order of questions in the array should be 2 easy, then 2 medium, then 2 hard.
      Do not add any markdown formatting.
    `;

     const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    config: {
      thinkingConfig: {
        thinkingBudget: 0, // Disables thinking
      },
    }
    });
    const question = result.text ?? "";
    const questions = JSON.parse(question);
        if (!question) {
      return NextResponse.json({ message: 'Failed to generate question.' }, { status: 500 });
    }
    console.log("Generated questions:", questions);
    return NextResponse.json({ questions });

  } catch (error) {
    console.error("Error generating question:", error);
    return NextResponse.json({ message: 'Failed to generate question from AI.' }, { status: 500 });
  }
}