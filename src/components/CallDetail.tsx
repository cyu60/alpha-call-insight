import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, TrendingUp, User, Star, Building, Briefcase, Shield, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Call } from "@/types/call";

interface CallDetailProps {
  call: Call;
  onBack: () => void;
}

interface DueDiligenceResult {
  quantitativeAnalysis: {
    revenue: number | null;
    consumer_acquisition_cost: number | null;
    team_size: number | null;
    stage: string | null;
    region: string | null;
    industry: string | null;
    founder_name: string | null;
    verdict: 'PASS' | 'FAIL';
    reasoning: string;
  };
  qualitativeAnalysis: {
    pedigree: string | null;
    repeat_founder: boolean;
    social_capital: string | null;
    conviction_analysis: string;
    clarity_analysis: string;
    passion_analysis: string;
    coachability_analysis: string;
    verdict: 'PASS' | 'FAIL';
    reasoning: string;
  };
  strategicAnalysis: {
    company_values: string | null;
    business_model: string;
    market_originality: string;
    overall_strength_of_pitch: string;
    verdict: 'PASS' | 'FAIL';
    reasoning: string;
  };
  verificationAnalysis: {
    verified: boolean;
    confidence: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
    reasoning: string;
    sources_found: number;
    details: string;
    verdict: 'PASS' | 'FAIL';
  };
  accept: boolean;
}

export const CallDetail = ({ call, onBack }: CallDetailProps) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DueDiligenceResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const runDueDiligence = async () => {
    setAnalyzing(true);
    setAnalysisError(null);

    try {
      // Convert transcript to plain text format
      const transcriptText = call.transcript
        .map(line => `${line.speaker} (${line.timestamp}): ${line.text}`)
        .join('\n');

      const response = await fetch('/api/analyze-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: transcriptText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to analyze call');
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setAnalyzing(false);
    }
  };

  const VerdictBadge = ({ verdict }: { verdict: 'PASS' | 'FAIL' }) => (
    <Badge
      variant={verdict === 'PASS' ? 'default' : 'destructive'}
      className="flex items-center gap-1"
    >
      {verdict === 'PASS' ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <XCircle className="w-4 h-4" />
      )}
      {verdict}
    </Badge>
  );

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
          <div className="flex items-center gap-3">
            <Badge
              variant={call.sentiment === 'positive' ? 'default' : call.sentiment === 'neutral' ? 'secondary' : 'destructive'}
              className="capitalize text-lg px-4 py-2"
            >
              {call.sentiment}
            </Badge>
            <Button
              onClick={runDueDiligence}
              disabled={analyzing}
              className="bg-primary hover:bg-primary/90"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Run Due Diligence
                </>
              )}
            </Button>
          </div>
        </div>

        {analysisError && (
          <Card className="mb-6 p-4 bg-destructive/10 border-destructive">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive mb-1">Analysis Failed</h3>
                <p className="text-sm text-destructive/90">{analysisError}</p>
              </div>
            </div>
          </Card>
        )}

        {analysisResult && (
          <Card className="mb-6 p-6 bg-secondary/50 border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Due Diligence Report</h2>
              <Badge
                variant={analysisResult.accept ? 'default' : 'destructive'}
                className="text-lg px-4 py-2"
              >
                {analysisResult.accept ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    ACCEPTED
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 mr-2" />
                    REJECTED
                  </>
                )}
              </Badge>
            </div>

            <div className="space-y-6">
              {/* Quantitative Analysis */}
              <Card className="p-5 bg-background/50 border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-foreground">Quantitative Analysis</h3>
                  <VerdictBadge verdict={analysisResult.quantitativeAnalysis.verdict} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {analysisResult.quantitativeAnalysis.founder_name && (
                    <div>
                      <span className="text-sm text-muted-foreground">Founder</span>
                      <p className="font-medium">{analysisResult.quantitativeAnalysis.founder_name}</p>
                    </div>
                  )}
                  {analysisResult.quantitativeAnalysis.industry && (
                    <div>
                      <span className="text-sm text-muted-foreground">Industry</span>
                      <p className="font-medium">{analysisResult.quantitativeAnalysis.industry}</p>
                    </div>
                  )}
                  {analysisResult.quantitativeAnalysis.stage && (
                    <div>
                      <span className="text-sm text-muted-foreground">Stage</span>
                      <p className="font-medium">{analysisResult.quantitativeAnalysis.stage}</p>
                    </div>
                  )}
                  {analysisResult.quantitativeAnalysis.revenue !== null && (
                    <div>
                      <span className="text-sm text-muted-foreground">MRR</span>
                      <p className="font-medium">${analysisResult.quantitativeAnalysis.revenue.toLocaleString()}</p>
                    </div>
                  )}
                  {analysisResult.quantitativeAnalysis.team_size !== null && (
                    <div>
                      <span className="text-sm text-muted-foreground">Team Size</span>
                      <p className="font-medium">{analysisResult.quantitativeAnalysis.team_size}</p>
                    </div>
                  )}
                  {analysisResult.quantitativeAnalysis.region && (
                    <div>
                      <span className="text-sm text-muted-foreground">Region</span>
                      <p className="font-medium">{analysisResult.quantitativeAnalysis.region}</p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{analysisResult.quantitativeAnalysis.reasoning}</p>
              </Card>

              {/* Qualitative Analysis */}
              <Card className="p-5 bg-background/50 border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-foreground">Qualitative Analysis</h3>
                  <VerdictBadge verdict={analysisResult.qualitativeAnalysis.verdict} />
                </div>
                <div className="space-y-3 mb-4">
                  {analysisResult.qualitativeAnalysis.pedigree && (
                    <div>
                      <span className="text-sm text-muted-foreground block mb-1">Pedigree</span>
                      <p className="text-sm">{analysisResult.qualitativeAnalysis.pedigree}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="text-sm text-muted-foreground block mb-1">Conviction</span>
                      <p className="text-sm">{analysisResult.qualitativeAnalysis.conviction_analysis}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground block mb-1">Clarity</span>
                      <p className="text-sm">{analysisResult.qualitativeAnalysis.clarity_analysis}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground block mb-1">Passion</span>
                      <p className="text-sm">{analysisResult.qualitativeAnalysis.passion_analysis}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground block mb-1">Coachability</span>
                      <p className="text-sm">{analysisResult.qualitativeAnalysis.coachability_analysis}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{analysisResult.qualitativeAnalysis.reasoning}</p>
              </Card>

              {/* Strategic Analysis */}
              <Card className="p-5 bg-background/50 border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-foreground">Strategic Analysis</h3>
                  <VerdictBadge verdict={analysisResult.strategicAnalysis.verdict} />
                </div>
                <div className="space-y-3 mb-4">
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Business Model</span>
                    <p className="text-sm">{analysisResult.strategicAnalysis.business_model}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Market Originality</span>
                    <p className="text-sm">{analysisResult.strategicAnalysis.market_originality}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Pitch Strength</span>
                    <p className="text-sm">{analysisResult.strategicAnalysis.overall_strength_of_pitch}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{analysisResult.strategicAnalysis.reasoning}</p>
              </Card>

              {/* Verification Analysis */}
              <Card className="p-5 bg-background/50 border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-foreground">Verification Analysis (MCP)</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {analysisResult.verificationAnalysis.confidence} confidence
                    </Badge>
                    <VerdictBadge verdict={analysisResult.verificationAnalysis.verdict} />
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Sources Found</span>
                    <p className="text-sm font-medium">{analysisResult.verificationAnalysis.sources_found}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Details</span>
                    <p className="text-sm">{analysisResult.verificationAnalysis.details}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Reasoning</span>
                    <p className="text-sm">{analysisResult.verificationAnalysis.reasoning}</p>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        )}

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
