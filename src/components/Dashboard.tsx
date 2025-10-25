import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CallCard } from "./CallCard";
import { CallDetail } from "./CallDetail";
import { Call } from "@/types/call";

const mockCalls: Call[] = [
  {
    id: "1",
    title: "Q4 Investment Strategy Discussion",
    participant: "Sarah Chen, Portfolio Manager",
    date: "2024-03-15",
    duration: 1847,
    sentiment: "positive",
    summary: "Detailed discussion on Q4 investment opportunities focusing on emerging tech sectors. Key emphasis on AI infrastructure and renewable energy portfolios. Agreement reached on allocation strategy with 15% increase in tech sector exposure.",
    keyMetrics: {
      actionItems: 5,
      keyTopics: 8,
      decisions: 3
    },
    transcript: [
      {
        speaker: "Sarah Chen",
        timestamp: "00:00",
        text: "Good morning. I wanted to discuss our Q4 strategy, particularly around the tech sector allocations we've been considering."
      },
      {
        speaker: "Investor",
        timestamp: "00:15",
        text: "Yes, I've reviewed the portfolio recommendations. The AI infrastructure plays look promising. Can you walk me through the risk assessment?"
      },
      {
        speaker: "Sarah Chen",
        timestamp: "00:32",
        text: "Absolutely. We've identified three key risk factors: market volatility in the semiconductor space, regulatory concerns around AI development, and competition intensity. However, the long-term growth trajectory remains strong."
      }
    ]
  },
  {
    id: "2",
    title: "Market Analysis: Healthcare Sector",
    participant: "Michael Torres, Senior Analyst",
    date: "2024-03-14",
    duration: 1523,
    sentiment: "neutral",
    summary: "Comprehensive review of healthcare sector performance and emerging opportunities in biotech. Discussion of regulatory landscape changes and their impact on portfolio positioning.",
    keyMetrics: {
      actionItems: 3,
      keyTopics: 6,
      decisions: 2
    },
    transcript: [
      {
        speaker: "Michael Torres",
        timestamp: "00:00",
        text: "Let's dive into the healthcare sector analysis. We're seeing some interesting movements in the biotech space."
      }
    ]
  },
  {
    id: "3",
    title: "Due Diligence: GreenTech Ventures",
    participant: "Emily Rodriguez, Research Lead",
    date: "2024-03-13",
    duration: 2156,
    sentiment: "positive",
    summary: "Initial due diligence call for potential investment in GreenTech Ventures. Strong fundamentals identified with promising growth metrics in renewable energy sector.",
    keyMetrics: {
      actionItems: 7,
      keyTopics: 12,
      decisions: 1
    },
    transcript: [
      {
        speaker: "Emily Rodriguez",
        timestamp: "00:00",
        text: "I've completed the preliminary analysis on GreenTech Ventures. The fundamentals look very strong."
      }
    ]
  }
];

export const Dashboard = () => {
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCalls = mockCalls.filter(call =>
    call.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    call.participant.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedCall) {
    return <CallDetail call={selectedCall} onBack={() => setSelectedCall(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Call Analytics
          </h1>
          <p className="text-muted-foreground">
            Review and analyze investor conversations
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search calls by title or participant..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-secondary/50 border-border focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCalls.map((call) => (
          <CallCard
            key={call.id}
            call={call}
            onClick={() => setSelectedCall(call)}
          />
        ))}
      </div>
    </div>
  );
};
