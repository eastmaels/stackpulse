import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Vote, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStacks } from "@/context/stacks-context";
import { useAllPolls, usePollOptions, useHasVoted, useInvalidatePolls } from "@/hooks/use-polls";
import { usePollActions } from "@/hooks/use-poll-actions";
import { TransactionStatus } from "@/components/stacks/transaction-status";
import { ConnectWallet } from "@/components/stacks/connect-wallet";
import { Poll, PollOption } from "@/lib/stacks/types";

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

interface VoteDialogProps {
  poll: Poll;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function VoteDialog({ poll, open, onOpenChange }: VoteDialogProps) {
  const { wallet } = useStacks();
  const [, navigate] = useLocation();
  const { vote, txState, resetTxState } = usePollActions();
  const { invalidatePoll, invalidateAll } = useInvalidatePolls();
  const { data: options, isLoading: optionsLoading } = usePollOptions(
    poll.pollId,
    poll.optionCount
  );
  const { data: hasVoted } = useHasVoted(poll.pollId);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Redirect to results page after successful vote
  useEffect(() => {
    if (txState.status === "success") {
      // Short delay to show success state, then redirect
      const timer = setTimeout(() => {
        invalidatePoll(poll.pollId);
        invalidateAll();
        onOpenChange(false);
        resetTxState();
        navigate(`/poll/${poll.pollId}/results`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [txState.status, poll.pollId, navigate, invalidatePoll, invalidateAll, onOpenChange, resetTxState]);

  const handleVote = async () => {
    if (selectedOption !== null) {
      await vote(poll.pollId, selectedOption);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    resetTxState();
    setSelectedOption(null);
    // Invalidate poll data to refresh vote counts
    invalidatePoll(poll.pollId);
    invalidateAll();
  };

  const status = getPollStatus(poll);
  const canVote = status === "Active" && !hasVoted && wallet.isConnected;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{poll.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-4 pt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeLeft(poll.deadline)}
            </span>
            <span>{poll.totalVotes} votes</span>
          </DialogDescription>
        </DialogHeader>

        {!wallet.isConnected ? (
          <div className="py-8 text-center space-y-4">
            <p className="text-muted-foreground">Connect your wallet to vote</p>
            <ConnectWallet />
          </div>
        ) : hasVoted ? (
          <div className="py-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <div>
              <p className="font-medium text-lg">You have already voted!</p>
              <p className="text-muted-foreground text-sm">
                Your vote has been recorded on the blockchain.
              </p>
            </div>
            {options && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Current Results:</p>
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded"
                  >
                    <span>{option.text}</span>
                    <span className="font-medium">{option.voteCount} votes</span>
                  </div>
                ))}
              </div>
            )}
            <Button
              className="mt-4"
              onClick={() => {
                onOpenChange(false);
                navigate(`/poll/${poll.pollId}/results`);
              }}
            >
              View Full Results
            </Button>
          </div>
        ) : status !== "Active" ? (
          <div className="py-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
            <div>
              <p className="font-medium text-lg">Poll is {status.toLowerCase()}</p>
              <p className="text-muted-foreground text-sm">
                This poll is no longer accepting votes.
              </p>
            </div>
            {options && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Final Results:</p>
                {options.map((option, index) => {
                  const percentage =
                    poll.totalVotes > 0
                      ? Math.round((option.voteCount / poll.totalVotes) * 100)
                      : 0;
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{option.text}</span>
                        <span className="font-medium">
                          {option.voteCount} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-secondary to-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Button
              className="mt-4"
              onClick={() => {
                onOpenChange(false);
                navigate(`/poll/${poll.pollId}/results`);
              }}
            >
              View Full Results
            </Button>
          </div>
        ) : txState.status !== "idle" ? (
          <div className="py-4">
            <TransactionStatus state={txState} onClose={handleClose} />
          </div>
        ) : (
          <>
            <div className="py-4">
              {optionsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading options...
                </div>
              ) : options && options.length > 0 ? (
                <RadioGroup
                  value={selectedOption?.toString()}
                  onValueChange={(v) => setSelectedOption(parseInt(v))}
                >
                  <div className="space-y-3">
                    {options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 rounded-lg border hover:border-secondary/50 transition-colors"
                      >
                        <RadioGroupItem
                          value={index.toString()}
                          id={`option-${index}`}
                        />
                        <Label
                          htmlFor={`option-${index}`}
                          className="flex-1 cursor-pointer"
                        >
                          {option.text}
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          {option.voteCount} votes
                        </span>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No options found for this poll
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleVote}
                disabled={selectedOption === null}
                className="bg-secondary hover:bg-secondary/90"
              >
                <Vote className="w-4 h-4 mr-2" />
                Cast Vote
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PollCard({ poll }: { poll: Poll }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: hasVoted } = useHasVoted(poll.pollId);
  const status = getPollStatus(poll);

  return (
    <>
      <Card
        className="hover:border-secondary/50 transition-all cursor-pointer group"
        onClick={() => setDialogOpen(true)}
      >
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
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
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              {formatTimeLeft(poll.deadline)}
            </div>
          </div>
          <CardTitle className="text-xl leading-snug group-hover:text-secondary transition-colors">
            {poll.title}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            by {poll.creator.slice(0, 8)}...{poll.creator.slice(-4)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-secondary to-primary"
              style={{
                width: poll.totalVotes > 0 ? "60%" : "0%",
              }}
            />
          </div>
          <div className="mt-2 text-xs text-muted-foreground text-right">
            {poll.totalVotes.toLocaleString()} votes cast
          </div>
        </CardContent>
        <CardFooter>
          {hasVoted ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                setDialogOpen(true);
              }}
            >
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
              View Results
            </Button>
          ) : status === "Active" ? (
            <Button
              className="w-full bg-secondary hover:bg-secondary/90 text-white"
              onClick={(e) => {
                e.stopPropagation();
                setDialogOpen(true);
              }}
            >
              <Vote className="w-4 h-4 mr-2" /> Vote Now
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                setDialogOpen(true);
              }}
            >
              View Results
            </Button>
          )}
        </CardFooter>
      </Card>
      <VoteDialog poll={poll} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}

export default function ParticipantDashboard() {
  const { data: polls, isLoading } = useAllPolls();

  // Filter active polls
  const activePolls =
    polls?.filter((p) => {
      const status = getPollStatus(p);
      return status === "Active";
    }) || [];

  // Get closed/expired polls
  const closedPolls =
    polls?.filter((p) => {
      const status = getPollStatus(p);
      return status !== "Active";
    }) || [];

  return (
    <DashboardLayout role="participant">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Active Polls</h1>
        <p className="text-muted-foreground mt-1">
          Cast your vote on active blockchain proposals
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          Loading polls from blockchain...
        </div>
      )}

      {/* Active Polls */}
      {activePolls.length > 0 && (
        <div className="grid gap-6 mb-8">
          {activePolls.map((poll, i) => (
            <motion.div
              key={poll.pollId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <PollCard poll={poll} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State for Active Polls */}
      {!isLoading && activePolls.length === 0 && (
        <div className="text-center py-12 mb-8">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Vote className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No active polls</h3>
          <p className="text-muted-foreground">
            Check back later for new polls to vote on
          </p>
        </div>
      )}

      {/* Closed/Expired Polls */}
      {closedPolls.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
            Past Polls
          </h2>
          <div className="grid gap-6 opacity-75">
            {closedPolls.map((poll, i) => (
              <motion.div
                key={poll.pollId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <PollCard poll={poll} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
