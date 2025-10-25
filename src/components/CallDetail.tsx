import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, TrendingUp, User } from "lucide-react";
import { Call } from "@/types/call";

interface CallDetailProps {
  call: Call;
  onBack: () => void;
}

export const CallDetail = ({ call, onBack }: CallDetailProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="hover:bg-secondary"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Calls
      </Button>

      <Card className="p-8 bg-gradient-card border-border">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-4">{call.title}</h1>
            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{call.participant}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(call.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{formatDuration(call.duration)}</span>
              </div>
            </div>
          </div>
          <Badge 
            variant={call.sentiment === 'positive' ? 'default' : call.sentiment === 'neutral' ? 'secondary' : 'destructive'}
            className="capitalize text-lg px-4 py-2"
          >
            {call.sentiment}
          </Badge>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">Summary</h2>
          <p className="text-muted-foreground leading-relaxed">{call.summary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-secondary/50 border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Action Items</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{call.keyMetrics.actionItems}</p>
          </Card>
          <Card className="p-4 bg-secondary/50 border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Key Topics</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{call.keyMetrics.keyTopics}</p>
          </Card>
          <Card className="p-4 bg-secondary/50 border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Decisions Made</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{call.keyMetrics.decisions}</p>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Transcript</h2>
          <div className="bg-secondary/30 rounded-lg p-6 space-y-4 max-h-96 overflow-y-auto">
            {call.transcript.map((line, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary">{line.speaker}</span>
                  <span className="text-xs text-muted-foreground">{line.timestamp}</span>
                </div>
                <p className="text-foreground/90 leading-relaxed pl-2">{line.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
