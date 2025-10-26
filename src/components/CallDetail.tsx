import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, TrendingUp, User, Star, Building, Briefcase } from "lucide-react";
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

        {call.metadata && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Lead Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {call.metadata.lead_score !== undefined && (
                <Card className="p-4 bg-secondary/50 border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Lead Score</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{call.metadata.lead_score}/10</p>
                </Card>
              )}
              {call.metadata.follow_up_date && (
                <Card className="p-4 bg-secondary/50 border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Follow-up Date</span>
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    {new Date(call.metadata.follow_up_date).toLocaleDateString()}
                  </p>
                </Card>
              )}
              {call.metadata.updated_at && (
                <Card className="p-4 bg-secondary/50 border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(call.metadata.updated_at).toLocaleString()}
                  </p>
                </Card>
              )}
              {call.metadata.user_enrichment?.company_name && (
                <Card className="p-4 bg-secondary/50 border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Company</span>
                  </div>
                  <p className="text-foreground font-medium">{call.metadata.user_enrichment.company_name}</p>
                </Card>
              )}
              {call.metadata.user_enrichment?.industry && (
                <Card className="p-4 bg-secondary/50 border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Industry</span>
                  </div>
                  <p className="text-foreground font-medium">{call.metadata.user_enrichment.industry}</p>
                </Card>
              )}
              {call.metadata.user_enrichment?.context && (
                <Card className="p-4 bg-secondary/50 border-border md:col-span-3">
                  <span className="text-sm text-muted-foreground block mb-2">Context</span>
                  <p className="text-foreground leading-relaxed">{call.metadata.user_enrichment.context}</p>
                </Card>
              )}
            </div>
          </div>
        )}

        {call.dataCollection && Object.values(call.dataCollection).some(v => v) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Founder Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {call.dataCollection.name && (
                <Card className="p-4 bg-secondary/50 border-border">
                  <span className="text-sm text-muted-foreground block mb-1">Name</span>
                  <p className="text-foreground font-medium">{call.dataCollection.name}</p>
                </Card>
              )}
              {call.dataCollection.profile && (
                <Card className="p-4 bg-secondary/50 border-border md:col-span-2">
                  <span className="text-sm text-muted-foreground block mb-1">Profile</span>
                  <p className="text-foreground">{call.dataCollection.profile}</p>
                </Card>
              )}
              {call.dataCollection.stage && (
                <Card className="p-4 bg-secondary/50 border-border">
                  <span className="text-sm text-muted-foreground block mb-1">Stage</span>
                  <p className="text-foreground font-medium">{call.dataCollection.stage}</p>
                </Card>
              )}
              {call.dataCollection.revenue && (
                <Card className="p-4 bg-secondary/50 border-border">
                  <span className="text-sm text-muted-foreground block mb-1">Revenue</span>
                  <p className="text-foreground font-medium">{call.dataCollection.revenue}</p>
                </Card>
              )}
              {call.dataCollection.region && (
                <Card className="p-4 bg-secondary/50 border-border">
                  <span className="text-sm text-muted-foreground block mb-1">Region</span>
                  <p className="text-foreground font-medium">{call.dataCollection.region}</p>
                </Card>
              )}
            </div>
          </div>
        )}

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
