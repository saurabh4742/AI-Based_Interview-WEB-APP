import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({});

export async function POST(req: NextRequest) {
  try {
    const { resumeText } = await req.json();

    if (!resumeText) {
      return NextResponse.json(
        { message: "Resume is required." },
        { status: 400 }
      );
    }

    // const historyText = Array.isArray(history) && history.length > 0
    //   ? `Do not repeat any of these previous questions: ${history.join(', ')}`
    //   : 'This is the first question.';

const prompt = `
You are an expert technical interviewer for a Software Development Engineer (SDE) role.
Analyze the following resume text and generate a set of 6 unique interview questions. The set must be a mix of questions based on the candidate's resume and fundamental Data Structures & Algorithms (DSA) problems.

Rules:
- For resume-based questions, do NOT ask generic questions. They must directly relate to the candidate's listed skills, technologies, and projects, evaluating their experience in areas like scaling, optimization, debugging, and system design.
- For DSA questions, present a clear problem statement and instruct the candidate to write the code in a language of their choice. The question must specify the expected input and output format.

The final set of 6 questions must contain exactly:
  - 2 "Easy" questions (one based on a technology from the resume, one simple DSA concept).
  - 1 "Medium" question involving a scenario-based problem using the resume's tech stack.
  - 1 "Medium" DSA coding question (e.g., involving arrays, strings, hash maps) where the candidate must write a function.
  - 1 "Hard" system design question based on the candidate's projects or experience from the resume.
  - 1 "Hard" DSA coding question (e.g., involving trees, graphs, or dynamic programming) where the candidate must write a function and explain its complexity.

- Return the response as a single, valid JSON array of objects.
- Each object in the array must have two keys: "text" (the question string, including any coding instructions) and "difficulty" (a string: "Easy", "Medium", or "Hard").
- The order of questions in the array should be 2 Easy, then 2 Medium, then 2 Hard.
- Do not add any markdown formatting.

Resume content:
${resumeText}
`;


    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking
        },
      },
    });
    const question = result.text ?? "";
    const questions = JSON.parse(question);
    if (!question) {
      return NextResponse.json(
        { message: "Failed to generate question." },
        { status: 500 }
      );
    }
    console.log("Generated questions:", questions);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error generating question:", error);
    return NextResponse.json(
      { message: "Failed to generate question from AI." },
      { status: 500 }
    );
  }
}
