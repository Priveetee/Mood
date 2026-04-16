type ResultsFilters = {
  campaignId: number | "all";
  managerName: string | "all";
  dateRange: {
    from?: Date;
    to?: Date;
  };
};

export function buildResultsWhereClause(
  userId: string,
  filters: ResultsFilters,
): Record<string, unknown> {
  const whereClause: Record<string, unknown> = {
    campaign: { createdBy: userId },
  };

  if (filters.campaignId !== "all") {
    whereClause.campaignId = filters.campaignId;
  }

  if (filters.dateRange.from && filters.dateRange.to) {
    whereClause.createdAt = {
      gte: filters.dateRange.from,
      lte: filters.dateRange.to,
    };
  }

  if (filters.managerName !== "all") {
    whereClause.pollLink = { managerName: filters.managerName };
  }

  return whereClause;
}
