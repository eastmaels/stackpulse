import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Vote, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ParticipantDashboard() {
  const polls = [
    { 
      id: 1, 
      question: "Should we implement SIP-015 regarding token standards?", 
      project: "Stacks Governance",
      votes: 1542,
      timeLeft: "2 days",
      status: "Active"
    },
    { 
      id: 2, 
      question: "Choose the next DeFi integration for the ecosystem", 
      project: "Community DAO",
      votes: 890,
      timeLeft: "5 hours",
      status: "Active"
    },
    { 
      id: 3, 
      question: "Ratify the Q1 2025 Budget Proposal", 
      project: "Treasury",
      votes: 3200,
      timeLeft: "Ended",
      status: "Closed"
    },
  ];

  return (
    <DashboardLayout role="participant">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Active Polls</h1>
        <p className="text-muted-foreground mt-1">Cast your vote on active proposals</p>
      </div>

      <div className="grid gap-6">
        {polls.map((poll, i) => (
          <motion.div
            key={poll.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:border-secondary/50 transition-all cursor-pointer group">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-transparent">
                    {poll.project}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    {poll.timeLeft}
                  </div>
                </div>
                <CardTitle className="text-xl leading-snug group-hover:text-secondary transition-colors">
                  {poll.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-secondary to-primary w-[60%]" 
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground text-right">
                  {poll.votes.toLocaleString()} votes cast
                </div>
              </CardContent>
              <CardFooter>
                 <Button className="w-full bg-secondary hover:bg-secondary/90 text-white">
                   <Vote className="w-4 h-4 mr-2" /> Vote Now
                 </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
