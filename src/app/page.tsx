import InterviewerDashboard from "@/components/InterviewerDashboard";
import IntervieweeView from "@/components/IntervieweeView";
import SessionManager from "@/components/SessionManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HomePage() {
  return (
    <main className="container mx-auto p-4 max-w-2xl">
      <SessionManager />
      <h1 className="text-3xl font-bold text-center mb-6">AI Interview Assistant</h1>
      <Tabs defaultValue="interviewee">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="interviewee">Interview</TabsTrigger>
          <TabsTrigger value="interviewer">Interviewer</TabsTrigger>
        </TabsList>
        <TabsContent value="interviewee">
          <IntervieweeView />
        </TabsContent>
        <TabsContent value="interviewer">
          <InterviewerDashboard />
        </TabsContent>
      </Tabs>
    </main>
  );
}