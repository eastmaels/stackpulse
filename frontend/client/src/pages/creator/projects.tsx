import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Plus, FolderKanban, MoreVertical, Calendar, Trash2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStacks } from "@/context/stacks-context";
import { usePollActions } from "@/hooks/use-poll-actions";
import { useAllPolls, usePollCount } from "@/hooks/use-polls";
import { TransactionStatus } from "@/components/stacks/transaction-status";
import { ConnectWallet } from "@/components/stacks/connect-wallet";
import { Poll } from "@/lib/stacks/types";

// Duration options in seconds
const DURATION_OPTIONS = [
  { label: "1 hour", value: 3600 },
  { label: "6 hours", value: 21600 },
  { label: "12 hours", value: 43200 },
  { label: "1 day", value: 86400 },
  { label: "3 days", value: 259200 },
  { label: "1 week", value: 604800 },
];

function CreatePollDialog() {
  const { wallet } = useStacks();
  const { createPoll, txState, resetTxState } = usePollActions();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState(86400); // 24 hours default

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    const validOptions = options.filter((o) => o.trim());
    if (title.trim() && validOptions.length >= 2) {
      await createPoll(title.trim(), validOptions, duration);
    }
  };

  const handleClose = () => {
    setOpen(false);
    resetTxState();
    setTitle("");
    setOptions(["", ""]);
    setDuration(86400);
  };

  const isValid = title.trim() && options.filter((o) => o.trim()).length >= 2;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          <Plus className="w-5 h-5 mr-2" /> New Poll
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Poll</DialogTitle>
          <DialogDescription>
            Create a decentralized poll on the Stacks blockchain. Once created,
            votes are immutable and transparent.
          </DialogDescription>
        </DialogHeader>

        {!wallet.isConnected ? (
          <div className="py-8 text-center space-y-4">
            <p className="text-muted-foreground">
              Connect your wallet to create a poll
            </p>
            <ConnectWallet />
          </div>
        ) : txState.status !== "idle" ? (
          <div className="py-4">
            <TransactionStatus state={txState} onClose={handleClose} />
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Poll Question</Label>
                <Input
                  id="title"
                  placeholder="What should we decide?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  {title.length}/100 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        maxLength={50}
                      />
                      {options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          className="shrink-0"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {options.length < 10 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="mt-2"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Option
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label>Duration</Label>
                <Select
                  value={duration.toString()}
                  onValueChange={(v) => setDuration(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isValid}
              >
                Create Poll
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function formatTimeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}

function formatTimeLeft(deadline: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = deadline - now;

  if (diff <= 0) return "Ended";
  if (diff < 3600) return `${Math.floor(diff / 60)}m left`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h left`;
  return `${Math.floor(diff / 86400)}d left`;
}

function getPollStatus(poll: Poll): "Active" | "Closed" | "Expired" {
  if (poll.isClosed) return "Closed";
  const now = Math.floor(Date.now() / 1000);
  if (now >= poll.deadline) return "Expired";
  return "Active";
}

export default function CreatorProjects() {
  const { wallet } = useStacks();
  const { data: polls, isLoading } = useAllPolls();
  const { data: pollCount } = usePollCount();

  // Filter polls created by the current user
  const myPolls = polls?.filter((p) => p.creator === wallet.address) || [];

  // Mock projects for display (will be replaced with actual blockchain data)
  const mockProjects = [
    { id: 1, title: "Governance DAO V1", status: "Active", polls: 12, participants: 450, lastUpdate: "2h ago" },
    { id: 2, title: "Community Feedback Q1", status: "Draft", polls: 3, participants: 0, lastUpdate: "1d ago" },
  ];

  return (
    <DashboardLayout role="creator">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Polls</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your blockchain polls
            {pollCount !== undefined && ` (${pollCount} total on-chain)`}
          </p>
        </div>
        <CreatePollDialog />
      </div>

      {/* My Polls from Blockchain */}
      {myPolls.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">My Polls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPolls.map((poll, i) => {
              const status = getPollStatus(poll);
              return (
                <motion.div
                  key={poll.pollId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer group bg-card/50 backdrop-blur-xs">
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <FolderKanban className="w-5 h-5" />
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          status === "Active"
                            ? "border-green-500/50 text-green-500"
                            : status === "Expired"
                            ? "border-yellow-500/50 text-yellow-500"
                            : "border-muted text-muted-foreground"
                        }
                      >
                        {status}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="mb-2 text-lg line-clamp-2">
                        {poll.title}
                      </CardTitle>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mt-4">
                        <div>
                          <span className="block text-foreground font-medium">
                            {poll.optionCount}
                          </span>
                          Options
                        </div>
                        <div>
                          <span className="block text-foreground font-medium">
                            {poll.totalVotes}
                          </span>
                          Votes
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-border/50 pt-4 text-xs text-muted-foreground flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Created {formatTimeAgo(poll.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeLeft(poll.deadline)}
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Blockchain Polls */}
      {polls && polls.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">All On-Chain Polls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll, i) => {
              const status = getPollStatus(poll);
              return (
                <motion.div
                  key={poll.pollId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer group bg-card/50 backdrop-blur-xs">
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                        <FolderKanban className="w-5 h-5" />
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          status === "Active"
                            ? "border-green-500/50 text-green-500"
                            : status === "Expired"
                            ? "border-yellow-500/50 text-yellow-500"
                            : "border-muted text-muted-foreground"
                        }
                      >
                        {status}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="mb-2 text-lg line-clamp-2">
                        {poll.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mb-4">
                        by {poll.creator ? `${poll.creator.slice(0, 8)}...${poll.creator.slice(-4)}` : 'Unknown'}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="block text-foreground font-medium">
                            {poll.optionCount}
                          </span>
                          Options
                        </div>
                        <div>
                          <span className="block text-foreground font-medium">
                            {poll.totalVotes}
                          </span>
                          Votes
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-border/50 pt-4 text-xs text-muted-foreground flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatTimeAgo(poll.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeLeft(poll.deadline)}
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State or Loading */}
      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          Loading polls from blockchain...
        </div>
      )}

      {!isLoading && (!polls || polls.length === 0) && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No polls yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first decentralized poll on the Stacks blockchain
          </p>
        </div>
      )}

      {/* Legacy Mock Projects */}
      {mockProjects.length > 0 && (
        <div className="mt-8 opacity-50">
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
            Demo Projects (Not on-chain)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProjects.map((project, i) => (
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="mb-2 text-xl">{project.title}</CardTitle>
                    <div className="flex gap-2 mb-4">
                      <Badge
                        variant="outline"
                        className={
                          project.status === "Active"
                            ? "border-green-500/50 text-green-500"
                            : project.status === "Draft"
                            ? "border-yellow-500/50 text-yellow-500"
                            : "border-muted text-muted-foreground"
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="block text-foreground font-medium">
                          {project.polls}
                        </span>
                        Polls
                      </div>
                      <div>
                        <span className="block text-foreground font-medium">
                          {project.participants}
                        </span>
                        Voters
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border/50 pt-4 text-xs text-muted-foreground flex items-center">
                    <Calendar className="w-3 h-3 mr-1" /> Updated{" "}
                    {project.lastUpdate}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
