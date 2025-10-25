import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, User } from "lucide-react";
import { Call } from "@/types/call";

interface CallCardProps {
  call: Call;
  onClick: () => void;
}

export const CallCard = ({ call, onClick }: CallCardProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card 
      className="p-6 bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-glow group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {call.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{call.participant}</span>
          </div>
        </div>
        <Badge 
          variant={call.sentiment === 'positive' ? 'default' : call.sentiment === 'neutral' ? 'secondary' : 'destructive'}
          className="capitalize"
        >
          {call.sentiment}
        </Badge>
      </div>
      
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{formatDuration(call.duration)}</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <span>{call.keyMetrics.actionItems} action items</span>
        </div>
      </div>
      
      <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
        {call.summary}
      </p>
    </Card>
  );
};
