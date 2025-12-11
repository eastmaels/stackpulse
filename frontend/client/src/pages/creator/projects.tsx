import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Plus, FolderKanban, MoreVertical, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CreatorProjects() {
  const projects = [
    { id: 1, title: "Governance DAO V1", status: "Active", polls: 12, participants: 450, lastUpdate: "2h ago" },
    { id: 2, title: "Community Feedback Q1", status: "Draft", polls: 3, participants: 0, lastUpdate: "1d ago" },
    { id: 3, title: "Tokenomics Upgrade", status: "Closed", polls: 1, participants: 1200, lastUpdate: "1w ago" },
  ];

  return (
    <DashboardLayout role="creator">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your polling campaigns</p>
        </div>
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          <Plus className="w-5 h-5 mr-2" /> New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:border-primary/50 transition-colors cursor-pointer group bg-card/50 backdrop-blur-xs">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <CardTitle className="mb-2 text-xl">{project.title}</CardTitle>
                <div className="flex gap-2 mb-4">
                  <Badge variant="outline" className={
                    project.status === "Active" ? "border-green-500/50 text-green-500" :
                    project.status === "Draft" ? "border-yellow-500/50 text-yellow-500" :
                    "border-muted text-muted-foreground"
                  }>
                    {project.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="block text-foreground font-medium">{project.polls}</span>
                    Polls
                  </div>
                  <div>
                    <span className="block text-foreground font-medium">{project.participants}</span>
                    Voters
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-border/50 pt-4 text-xs text-muted-foreground flex items-center">
                <Calendar className="w-3 h-3 mr-1" /> Updated {project.lastUpdate}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
        
        {/* New Project Placeholder */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: projects.length * 0.1 }}
           className="h-full min-h-[240px]"
        >
          <div className="h-full rounded-xl border border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:text-primary gap-3">
             <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
               <Plus className="w-6 h-6" />
             </div>
             <span className="font-medium">Create New Project</span>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
