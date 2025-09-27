"use client";

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Document, pdfjs } from 'react-pdf/legacy/dist/entry.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ... the rest of the file remains exactly the same ...

// Define the structure of the props this component will accept
interface PdfHandlerProps {
  onTextExtracted: (info: { email: string; phone: string }) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string) => void;
}

export default function PdfHandler({ onTextExtracted, setIsLoading, setError }: PdfHandlerProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Configure the worker inside a useEffect hook
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setError('');
      setPdfFile(file);
    }
  }, [setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const onDocumentLoadSuccess = async (pdf: any) => {
    setIsLoading(true);
    try {
      let textContent = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        textContent += text.items.map((s: any) => s.str).join(' ');
      }
      
      const emailMatch = textContent.match(/[\w.-]+@[\w.-]+\.\w+/);
      const phoneMatch = textContent.match(/\b\d{10}\b|\(\d{3}\)\s*\d{3}-\d{4}/);
      
      onTextExtracted({
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
      });
    } catch (e) {
      // Add a console log to see the specific error if it happens again
      console.error("Detailed PDF processing error:", e);
      setError("Failed to process the PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Upload Resume to Begin</CardTitle></CardHeader>
      <CardContent {...getRootProps()} className="border-2 border-dashed p-8 text-center cursor-pointer hover:border-primary">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here ...</p>
        ) : (
          <p>Drag n drop a PDF here, or click to select.</p>
        )}
      </CardContent>
      <div className="hidden">
        {pdfFile && <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess} onLoadError={(err) => {
            console.error("PDF load error:", err);
            setError('Failed to load PDF.');
        }} />}
      </div>
    </Card>
  );
}