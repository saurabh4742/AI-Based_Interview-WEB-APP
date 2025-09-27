"use client";

import { useState, useEffect } from 'react';
import { useInterviewStore, Candidate } from '@/store/interviewStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function InterviewerDashboard() {
  const { candidates } = useInterviewStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true) }, []);

  if (!isClient) return null;

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
    <div className="space-y-4">
      <Input
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="cursor-pointer" onClick={toggleSortOrder}>
              Score {sortOrder === 'asc' ? '▲' : '▼'}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCandidates.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell>{candidate.name}</TableCell>
              <TableCell>{candidate.email}</TableCell>
              <TableCell>{candidate.phone}</TableCell>
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
  );
}