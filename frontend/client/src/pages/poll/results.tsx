import { useParams, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Cell, PieChart, Pie, ResponsiveContainer } from "recharts";
import { ArrowLeft, Clock, Users, CheckCircle2, Trophy, ExternalLink } from "lucide-react";
import { usePoll, usePollOptions } from "@/hooks/use-polls";
import { useStacks } from "@/context/stacks-context";
import { getExplorerTxUrl } from "@/lib/stacks";
import { Poll } from "@/lib/stacks/types";

// Color palette for chart
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#06b6d4",
];

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

function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  );
}

export default function PollResults() {
  const params = useParams<{ pollId: string }>();
  const [, navigate] = useLocation();
  const { networkType } = useStacks();
  const pollId = parseInt(params.pollId || "0");

  const { data: poll, isLoading: pollLoading } = usePoll(pollId);
  const { data: options, isLoading: optionsLoading } = usePollOptions(
    pollId,
    poll?.optionCount || 0
  );

  const isLoading = pollLoading || optionsLoading;

  if (isLoading) {
    return (
      <DashboardLayout role="participant">
        <ResultsSkeleton />
      </DashboardLayout>
    );
  }

  if (!poll) {
    return (
      <DashboardLayout role="participant">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Poll Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The poll you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/participant/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const status = getPollStatus(poll);
  const totalVotes = poll.totalVotes;

  // Prepare chart data
  const chartData = options?.map((option, index) => ({
    name: option.text || `Option ${index + 1}`,
    votes: option.voteCount,
    percentage: totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0,
    fill: COLORS[index % COLORS.length],
  })) || [];

  // Find winner(s)
  const maxVotes = Math.max(...chartData.map((d) => d.votes), 0);
  const winners = chartData.filter((d) => d.votes === maxVotes && d.votes > 0);

  // Chart config for shadcn charts
  const chartConfig: ChartConfig = chartData.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <DashboardLayout role="participant">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/participant/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Polls
        </Button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">{poll.title}</h1>
            <p className="text-muted-foreground mt-1">
              Created by {poll.creator.slice(0, 8)}...{poll.creator.slice(-4)}
            </p>
          </div>

          <div className="flex items-center gap-3">
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
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalVotes}</p>
                <p className="text-sm text-muted-foreground">Total Votes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{poll.optionCount}</p>
                <p className="text-sm text-muted-foreground">Options</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatTimeLeft(poll.deadline)}</p>
                <p className="text-sm text-muted-foreground">Time Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Winner Banner */}
      {totalVotes > 0 && status !== "Active" && winners.length > 0 && (
        <Card className="mb-8 border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {winners.length > 1 ? "Winners (Tie)" : "Winner"}
                </p>
                <p className="text-xl font-bold">
                  {winners.map((w) => w.name).join(", ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {maxVotes} votes ({winners[0]?.percentage}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Vote Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, item) => (
                          <span>
                            {value} votes ({item.payload.percentage}%)
                          </span>
                        )}
                      />
                    }
                  />
                  <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No votes yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Vote Share</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 && totalVotes > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, item) => (
                          <span>
                            {value} votes ({item.payload.percentage}%)
                          </span>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={chartData}
                    dataKey="votes"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percentage }) =>
                      percentage > 5 ? `${percentage}%` : ""
                    }
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No votes yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chartData.map((option, index) => {
              const isWinner = option.votes === maxVotes && option.votes > 0;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: option.fill }}
                      />
                      <span className="font-medium">{option.name}</span>
                      {isWinner && status !== "Active" && (
                        <Badge variant="secondary" className="text-xs">
                          <Trophy className="w-3 h-3 mr-1" />
                          Winner
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {option.votes} votes ({option.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${option.percentage}%`,
                        backgroundColor: option.fill,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
