import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Plus, ScrollText, Target, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function CreatorQuests() {
  const quests = [
    { 
      id: 1, 
      title: "Early Voter", 
      description: "Vote in 5 polls this week to earn the Early Bird badge.",
      progress: 65,
      reward: "50 XP"
    },
    { 
      id: 2, 
      title: "Consensus Keeper", 
      description: "Participate in the Governance DAO V1 proposal.",
      progress: 30,
      reward: "NFT Badge"
    },
  ];

  return (
    <DashboardLayout role="creator">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Quests</h1>
          <p className="text-muted-foreground mt-1">Gamify participation with rewards</p>
        </div>
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          <Plus className="w-5 h-5 mr-2" /> New Quest
        </Button>
      </div>

      <div className="space-y-6">
        {quests.map((quest, i) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:border-secondary/50 transition-colors bg-card/50">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                        <Target className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-1">{quest.title}</CardTitle>
                        <p className="text-muted-foreground text-sm">{quest.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full text-xs font-medium">
                      <Trophy className="w-3 h-3 text-yellow-500" />
                      <span>{quest.reward}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Participation Rate</span>
                      <span>{quest.progress}%</span>
                    </div>
                    <Progress value={quest.progress} className="h-2 bg-muted" />
                  </div>
                </div>
                
                <div className="p-6 md:border-l border-border/50 flex flex-row md:flex-col gap-3 justify-center min-w-[150px]">
                  <Button variant="outline" className="w-full">Edit</Button>
                  <Button variant="secondary" className="w-full">Analytics</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
