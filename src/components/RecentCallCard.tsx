import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar, TrendingUp, Star } from "lucide-react";
import { Call } from "@/types/call";

interface RecentCallCardProps {
  call: Call;
  onClick: () => void;
}

export const RecentCallCard = ({ call, onClick }: RecentCallCardProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate confidence score based on metadata or default to sentiment-based score
  const getConfidenceScore = () => {
    if (call.metadata?.lead_score) {
      return call.metadata.lead_score;
    }
    // Fallback: derive from sentiment
    switch (call.sentiment) {
      case 'positive': return 85;
      case 'neutral': return 60;
      case 'negative': return 35;
      default: return 50;
    }
  };

  const confidenceScore = getConfidenceScore();

  return (
    <Card className="p-8 bg-gradient-to-br from-primary/10 via-background to-secondary/20 border-2 border-primary/30 hover:border-primary/60 transition-all duration-300 cursor-pointer hover:shadow-glow-lg group relative overflow-hidden">
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full opacity-50" />

      <div className="relative z-10">
        {/* Header with badge */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Most Recent Call
              </p>
              <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                {call.title}
              </h2>
            </div>
          </div>
          <Badge
            variant={call.sentiment === 'positive' ? 'default' : call.sentiment === 'neutral' ? 'secondary' : 'destructive'}
            className="capitalize text-sm px-3 py-1"
          >
            {call.sentiment}
          </Badge>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Participant info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="font-medium">Participant</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{call.participant}</p>
            {call.dataCollection?.name && call.dataCollection.name !== call.participant && (
              <p className="text-sm text-muted-foreground">{call.dataCollection.name}</p>
            )}
          </div>

          {/* Timing info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Date & Duration</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{formatDate(call.date)}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(call.duration)}</span>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">Confidence Score</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-secondary"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - confidenceScore / 100)}`}
                    className={`${
                      confidenceScore >= 70 ? 'text-green-500' :
                      confidenceScore >= 50 ? 'text-yellow-500' :
                      'text-red-500'
                    } transition-all duration-500`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-foreground">{confidenceScore}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">Lead Quality</p>
                <p className={`${
                  confidenceScore >= 70 ? 'text-green-500' :
                  confidenceScore >= 50 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {confidenceScore >= 70 ? 'High' : confidenceScore >= 50 ? 'Medium' : 'Low'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional details */}
        {call.dataCollection && (
          <div className="flex flex-wrap gap-4 mb-4">
            {call.dataCollection.stage && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Stage:</span>
                <Badge variant="outline">{call.dataCollection.stage}</Badge>
              </div>
            )}
            {call.dataCollection.revenue && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Revenue:</span>
                <Badge variant="outline">{call.dataCollection.revenue}</Badge>
              </div>
            )}
            {call.dataCollection.region && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Region:</span>
                <Badge variant="outline">{call.dataCollection.region}</Badge>
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Summary</p>
          <p className="text-sm text-foreground/80 line-clamp-2">
            {call.summary}
          </p>
        </div>

        {/* Key metrics */}
        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              <strong className="text-foreground">{call.keyMetrics.actionItems}</strong> action items
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">{call.keyMetrics.decisions}</strong> decisions
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">{call.keyMetrics.keyTopics}</strong> key topics
            </span>
          </div>
        </div>

        {/* Click to view indicator */}
        <div className="mt-6 text-center">
          <button
            onClick={onClick}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            View Full Details
          </button>
        </div>
      </div>
    </Card>
  );
};
