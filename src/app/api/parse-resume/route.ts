/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
// Use the deep import path for the specific library version
import * as pdfjs from "pdfjs-dist/build/pdf.min.mjs";

export async function POST(req: NextRequest) {
  try {
    // As per your research, this line ensures the worker is loaded in the server environment
    // @ts-ignore
    await import("pdfjs-dist/build/pdf.worker.min.mjs");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();

    // Use the document loading method from the imported library
    const doc = await pdfjs.getDocument(fileBuffer).promise;
    const numPages = doc.numPages;
    const fileContent: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      
      // The 'items' property can sometimes be untyped, so we use 'any'
      textContent.items.forEach((item: any) => {
        fileContent.push(item.str);
      });
    }

    return NextResponse.json({ text: fileContent.join(" ") });

  } catch (error) {
    console.error("Error parsing PDF on server:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: "Failed to parse PDF on the server.", details: errorMessage }, { status: 500 });
  }
}