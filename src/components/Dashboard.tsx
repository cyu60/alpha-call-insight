import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { CallCard } from "./CallCard";
import { CallDetail } from "./CallDetail";
import { RecentCallCard } from "./RecentCallCard";
import { FilterBar, FilterOptions } from "./FilterBar";
import { Call } from "@/types/call";
import { useConversations } from "@/hooks/useConversations";

export const Dashboard = () => {
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    region: [],
    stage: [],
    sector: [],
  });
  const { calls, loading, error } = useConversations();

  // Extract unique values for filters
  const availableRegions = useMemo(() => {
    const regions = new Set<string>();
    calls.forEach((call) => {
      if (call.dataCollection?.region) {
        regions.add(call.dataCollection.region);
      }
    });
    return Array.from(regions).sort();
  }, [calls]);

  const availableStages = useMemo(() => {
    const stages = new Set<string>();
    calls.forEach((call) => {
      if (call.dataCollection?.stage) {
        stages.add(call.dataCollection.stage);
      }
    });
    return Array.from(stages).sort();
  }, [calls]);

  const availableSectors = useMemo(() => {
    const sectors = new Set<string>();
    calls.forEach((call) => {
      if (call.metadata?.user_enrichment?.industry) {
        sectors.add(call.metadata.user_enrichment.industry);
      }
      // Also check profile field as it might contain industry info
      if (call.dataCollection?.profile) {
        sectors.add(call.dataCollection.profile);
      }
    });
    return Array.from(sectors).sort();
  }, [calls]);

  // Apply all filters
  const filteredCalls = useMemo(() => {
    return calls.filter((call) => {
      // Search query filter
      const matchesSearch =
        call.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.participant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.summary.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Region filter
      if (filters.region.length > 0) {
        if (
          !call.dataCollection?.region ||
          !filters.region.includes(call.dataCollection.region)
        ) {
          return false;
        }
      }

      // Stage filter
      if (filters.stage.length > 0) {
        if (
          !call.dataCollection?.stage ||
          !filters.stage.includes(call.dataCollection.stage)
        ) {
          return false;
        }
      }

      // Sector filter
      if (filters.sector.length > 0) {
        const callSector =
          call.metadata?.user_enrichment?.industry ||
          call.dataCollection?.profile;
        if (!callSector || !filters.sector.includes(callSector)) {
          return false;
        }
      }

      return true;
    });
  }, [calls, searchQuery, filters]);

  if (selectedCall) {
    return <CallDetail call={selectedCall} onBack={() => setSelectedCall(null)} />;
  }

  // Get the most recent call (first in the sorted array)
  const mostRecentCall = calls.length > 0 ? calls[0] : null;

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

      {/* Most Recent Call Card - shown above search */}
      {!loading && mostRecentCall && (
        <RecentCallCard
          call={mostRecentCall}
          onClick={() => setSelectedCall(mostRecentCall)}
        />
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search calls by title, participant, or summary..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-secondary/50 border-border focus:border-primary"
        />
      </div>

      {/* Filter Bar */}
      {!loading && calls.length > 0 && (
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          availableRegions={availableRegions}
          availableStages={availableStages}
          availableSectors={availableSectors}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive mb-2">Error loading conversations</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      ) : filteredCalls.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No conversations found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCalls.map((call) => (
            <CallCard
              key={call.id}
              call={call}
              onClick={() => setSelectedCall(call)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
