"use client";

import { useState, useEffect } from 'react';
import { useInterviewStore } from '@/store/interviewStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Medal,Trash2 } from 'lucide-react';
import clsx from 'clsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
const RankDisplay = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Medal className="h-6 w-6 text-yellow-400" />;
  if (rank === 2) return <Medal className="h-6 w-6 text-slate-400" />;
  if (rank === 3) return <Medal className="h-6 w-6 text-orange-500" />;
  return (
    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-muted-foreground font-semibold text-xs">
      {rank}
    </span>
  );
};

export default function InterviewerDashboard() {
  const { candidates, clearAllHistory } = useInterviewStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true) }, []);

  if (!isClient) return null;

  const sortedByScore = [...candidates].sort((a, b) => b.score - a.score);
  const rankMap = new Map<string, number>();
  sortedByScore.forEach((candidate, index) => {
    rankMap.set(candidate.id, index + 1);
  });
  
  const topThree = sortedByScore.slice(0, 3);

  const filteredCandidates = candidates
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => sortOrder === 'asc' ? a.score - b.score : b.score - a.score);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  if (candidates.length === 0) {
    return <p className="text-center text-muted-foreground p-8">No completed interviews to display yet.</p>;
  }

  return (
    <div className="space-y-8">
      {/* Podium Section */}
      {topThree.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">Top Performers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topThree.map((candidate, index) => (
              <Card key={candidate.id} className={clsx(
                'border-2',
                index === 0 && 'border-yellow-400/50',
                index === 1 && 'border-slate-400/50',
                index === 2 && 'border-orange-500/50'
              )}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{candidate.name}</CardTitle>
                  <RankDisplay rank={index + 1} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{candidate.score}/100</div>
                  <p className="text-xs text-muted-foreground truncate" title={candidate.summary}>
                    {candidate.summary}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Main Table Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Candidates</h2>
        <Input
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm mb-4"
        />
         {/* 3. Add the AlertDialog and Trigger button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all
                completed interview records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              {/* The 'Continue' action calls the clearAllHistory function */}
              <AlertDialogAction onClick={() => clearAllHistory()}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="cursor-pointer" onClick={toggleSortOrder}>
                Score {sortOrder === 'asc' ? '▲' : '▼'}
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell className="flex justify-center items-center">
                  {rankMap.has(candidate.id) && <RankDisplay rank={rankMap.get(candidate.id)!} />}
                </TableCell>
                <TableCell>{candidate.name}</TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell className="font-bold">{candidate.score}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">View Details</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Details for {candidate.name}</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-[70vh] overflow-y-auto p-4">
                        <p><strong>Score:</strong> {candidate.score}/100</p>
                        <p className="mt-2"><strong>AI Summary:</strong> {candidate.summary}</p>
                        <hr className="my-4" />
                        <h3 className="font-bold text-lg">Full Transcript:</h3>
                        <ul className="mt-2 space-y-4">
                          {candidate.transcript.map((item, index) => (
                            <li key={index} className="border-t pt-2">
                              <p><strong>Q:</strong> {item.question}</p>
                              <p><strong>A:</strong> {item.answer}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}