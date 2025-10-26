import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import { useState } from "react";

export interface FilterOptions {
  region: string[];
  stage: string[];
  sector: string[];
}

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  availableRegions: string[];
  availableStages: string[];
  availableSectors: string[];
}

export const FilterBar = ({
  filters,
  onFilterChange,
  availableRegions,
  availableStages,
  availableSectors,
}: FilterBarProps) => {
  const [showFilters, setShowFilters] = useState(true);

  const toggleFilter = (category: keyof FilterOptions, value: string) => {
    const currentFilters = filters[category];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter((v) => v !== value)
      : [...currentFilters, value];

    onFilterChange({
      ...filters,
      [category]: newFilters,
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      region: [],
      stage: [],
      sector: [],
    });
  };

  const hasActiveFilters =
    filters.region.length > 0 ||
    filters.stage.length > 0 ||
    filters.sector.length > 0;

  return (
    <Card className="p-4 bg-secondary/30 border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Filters</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {filters.region.length + filters.stage.length + filters.sector.length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showFilters ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="space-y-4">
          {/* Region Filter */}
          {availableRegions.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Region
              </label>
              <div className="flex flex-wrap gap-2">
                {availableRegions.map((region) => {
                  const isActive = filters.region.includes(region);
                  return (
                    <button
                      key={region}
                      onClick={() => toggleFilter("region", region)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/50 text-foreground hover:bg-secondary"
                      }`}
                    >
                      {region}
                      {isActive && <X className="inline-block w-3 h-3 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stage Filter */}
          {availableStages.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Stage
              </label>
              <div className="flex flex-wrap gap-2">
                {availableStages.map((stage) => {
                  const isActive = filters.stage.includes(stage);
                  return (
                    <button
                      key={stage}
                      onClick={() => toggleFilter("stage", stage)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/50 text-foreground hover:bg-secondary"
                      }`}
                    >
                      {stage}
                      {isActive && <X className="inline-block w-3 h-3 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sector/Industry Filter */}
          {availableSectors.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Sector
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSectors.map((sector) => {
                  const isActive = filters.sector.includes(sector);
                  return (
                    <button
                      key={sector}
                      onClick={() => toggleFilter("sector", sector)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/50 text-foreground hover:bg-secondary"
                      }`}
                    >
                      {sector}
                      {isActive && <X className="inline-block w-3 h-3 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
