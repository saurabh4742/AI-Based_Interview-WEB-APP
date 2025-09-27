// src/app/page.tsx
import InterviewerDashboard from "@/components/InterviewerDashboard";
import IntervieweeView from "@/components/IntervieweeView";
import SessionManager from "@/components/SessionManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HomePage() {
  return (
    <> {/* Use a fragment instead of <main> */}
      <SessionManager />
      {/* The H1 title is now in the Header, so we can remove it from here */}
      <Tabs defaultValue="interviewee">
        <TabsList className="grid w-full  grid-cols-2">
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
    </>
  );
}