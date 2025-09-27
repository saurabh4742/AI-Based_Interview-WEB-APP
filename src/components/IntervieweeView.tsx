"use client";

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useInterviewStore } from '@/store/interviewStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import RoseLoader from '@/components/ui/roseLoader';
import { Progress } from './ui/progress';

// Define the shape of a question object
interface Question {
  text: string;
  difficulty: string;
}

const getTimeLimit = (difficulty: string) => {
  if (difficulty === 'Easy') return 20;
  if (difficulty === 'Medium') return 60;
  return 120;
};

export default function IntervieweeView() {
  const { 
    interviewStatus, currentCandidateInfo, currentTranscript, 
    setCandidateInfo, startInfoCollection, startInterview, addTranscriptEntry, addCandidate, resetCurrentSession 
  } = useInterviewStore();
  
  // CHANGED: Removed 'currentQuestion' state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
 const [resumeText, setResumeText] = useState('');
  // PDF handling logic is untouched
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload and parse resume.');
      const data = await response.json();
      const textContent = data.text;
      console.log(textContent)
      const emailMatch = textContent.match(/[\w.-]+@[\w.-]+\.\w+/);
      const phoneMatch = textContent.match(/\b\d{10}\b|\(\d{3}\)\s*\d{3}-\d{4}/);
      setResumeText(textContent);
      console.log("ResumeTesxt",resumeText)
      setCandidateInfo({
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
        name: '',
      });
      startInfoCollection();
    } catch (e) {
      setError('Failed to process PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [resumeText, setCandidateInfo, startInfoCollection]);
  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1 });

  // CHANGED: This function now fetches ALL questions at once
  const fetchInterviewQuestions = useCallback(async () => {
    // if (!resumeText) {
    //   setError("Resume text was not found. Cannot generate questions.");
    //   return;
    // }

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/generateQuestion', { method: 'POST' ,body:JSON.stringify({ resumeText })});
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error("AI did not return any questions.");
      }
      setQuestions(data.questions);
      setTimeLeft(getTimeLimit(data.questions[0].difficulty));
    } catch (e) {
      setError('Could not start the interview. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  }, [setQuestions, setTimeLeft, setIsLoading, setError]);

  // This hook now calls the new function to fetch the entire question set
  useEffect(() => {
    if (interviewStatus === 'in_progress' && questions.length === 0) {
      fetchInterviewQuestions();
    }
  }, [interviewStatus, questions.length, fetchInterviewQuestions]);

  // CHANGED: This function is now much simpler
  const handleNextStep = useCallback(async () => {
    const currentQuestion = questions[currentQuestionIndex];
    addTranscriptEntry({ question: currentQuestion.text, answer: currentAnswer || 'No answer.' });
    setCurrentAnswer('');

    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < questions.length) {
      // Simply move to the next question in the local array
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft(getTimeLimit(questions[nextIndex].difficulty));
    } else {
      // End of interview
      setIsLoading(true);
      try {
        const response = await fetch('/api/generateSummary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: [...currentTranscript, { question: currentQuestion.text, answer: currentAnswer || 'No answer.' }] }),
        });
        if (!response.ok) throw new Error('API request failed');
        const result = await response.json();
        addCandidate(result);
      } catch (e) {
        setError("Error generating summary.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [addTranscriptEntry, currentAnswer, currentQuestionIndex, questions, currentTranscript, addCandidate]);

  // Timer logic remains the same
  useEffect(() => {
    if (interviewStatus === 'in_progress' && questions.length > 0) {
      const timer = setTimeout(() => {
        if (timeLeft > 0) setTimeLeft(timeLeft - 1);
        else handleNextStep();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, interviewStatus, questions.length, handleNextStep]);

  // --- Rendering Logic ---
  if (isLoading) return <div className="text-center p-8"><RoseLoader /></div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  if (interviewStatus === 'idle') {
    return (
      <Card>
        <CardHeader><CardTitle>Upload Resume to Begin</CardTitle></CardHeader>
        <CardContent {...getRootProps()} className="border-2 border-dashed p-8 text-center cursor-pointer hover:border-primary">
          <input {...getInputProps()} />
          <p>Drag n drop a PDF here, or click to select.</p>
        </CardContent>
      </Card>
    );
  }
  
  if (interviewStatus === 'collecting_info') {
    const isFormComplete = currentCandidateInfo.name && currentCandidateInfo.email && currentCandidateInfo.phone;
    return (
      <Card>
        <CardHeader><CardTitle>Please Confirm Your Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={currentCandidateInfo.name} onChange={(e) => setCandidateInfo({ name: e.target.value })} placeholder="Your full name" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={currentCandidateInfo.email} onChange={(e) => setCandidateInfo({ email: e.target.value })} placeholder="your@email.com" />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={currentCandidateInfo.phone} onChange={(e) => setCandidateInfo({ phone: e.target.value })} placeholder="Your phone number" />
          </div>
          <Button onClick={() => startInterview(currentCandidateInfo)} disabled={!isFormComplete} className="w-full">
            Start Interview
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (interviewStatus === 'in_progress' && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const progressValue = ((currentQuestionIndex + 1) / questions.length) * 100;
    return (
        <Card>
            <CardHeader>
              <Progress value={progressValue} className="mb-4" /> {/* PROGRESS BAR ADDED HERE */}
                <CardTitle>Question {currentQuestionIndex + 1}/{questions.length}</CardTitle>
                <div className="flex justify-between items-center"><p className="text-sm text-muted-foreground">{currentQuestion.difficulty}</p><p className="font-bold text-lg">{timeLeft}s</p></div>
            </CardHeader>
            <CardContent>
                <p className="mb-4 font-semibold text-lg">{currentQuestion.text}</p>
                <Input value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)} placeholder="Your answer..." />
                <Button onClick={handleNextStep} className="mt-4 w-full">Submit</Button>
            </CardContent>
        </Card>
    );
  }

  if (interviewStatus === 'completed') {
    const lastCandidate = useInterviewStore.getState().candidates.slice(-1)[0];
    return (
      <Card>
        <CardHeader><CardTitle>Interview Complete!</CardTitle></CardHeader>
        <CardContent>
          <p className="font-bold text-2xl">Final Score: {lastCandidate?.score}/100</p>
          <p className="mt-2"><strong>AI Summary:</strong> {lastCandidate?.summary}</p>
          <Button onClick={resetCurrentSession} className="mt-6 w-full">Start New Interview</Button>
        </CardContent>
      </Card>
    );
  }

  return <div className="p-8 text-center">Preparing interview...</div>;
}