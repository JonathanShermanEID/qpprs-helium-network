/**
 * Coverage Opportunities Dashboard
 * Network expansion opportunities and deployment recommendations
 * Author: Jonathan Sherman - Monaco Edition
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { MapPin, TrendingUp, AlertCircle, DollarSign, Users, Target } from "lucide-react";

export default function CoverageOpportunities() {
  const { data: opportunities, isLoading } = trpc.coverageOpportunities.list.useQuery();
  const { data: summary } = trpc.coverageOpportunities.summary.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading coverage opportunities...</p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active": return "default";
      case "deploying": return "default";
      case "planned": return "secondary";
      case "analyzing": return "secondary";
      case "detected": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl bg-card/30">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Coverage Opportunities
              </h1>
              <p className="text-muted-foreground mt-1">Network expansion and deployment recommendations</p>
            </div>
            <Button>
              <Target className="w-4 h-4 mr-2" />
              Plan Deployment
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalOpportunities}</div>
                <p className="text-xs text-muted-foreground">Areas identified</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Priority</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.criticalCount}</div>
                <p className="text-xs text-muted-foreground">Urgent deployments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Est. Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.totalEstimatedRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across all opportunities</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Coverage Gap</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.averageCoverageGap.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Expansion potential</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Opportunities List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {opportunities?.map((opportunity) => {
            const recommendations = opportunity.deploymentRecommendations 
              ? JSON.parse(opportunity.deploymentRecommendations)
              : null;

            return (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        {opportunity.city}, {opportunity.state}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {opportunity.country}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant={getPriorityColor(opportunity.priority)}>
                        {opportunity.priority}
                      </Badge>
                      <Badge variant={getStatusColor(opportunity.status)}>
                        {opportunity.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Coverage Gap</p>
                        <p className="text-2xl font-bold text-destructive">{opportunity.coverageGap}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Recommended Hotspots</p>
                        <p className="text-2xl font-bold text-primary">{opportunity.estimatedHotspots}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Est. Monthly Revenue</p>
                        <p className="text-xl font-bold text-green-500">${opportunity.estimatedRevenue?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Competitor Presence</p>
                        <p className="text-xl font-bold">{opportunity.competitorPresence}</p>
                      </div>
                    </div>

                    {/* Population Density */}
                    {opportunity.populationDensity && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Population Density:</span>
                        <span className="font-medium">{opportunity.populationDensity.toLocaleString()} /km²</span>
                      </div>
                    )}

                    {/* Deployment Zones */}
                    {recommendations?.zones && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Deployment Zones:</p>
                        <div className="space-y-2">
                          {recommendations.zones.slice(0, 3).map((zone: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                              <span className="font-medium">{zone.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {zone.recommendedHotspots} hotspots
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button variant="default" className="flex-1">
                        View Details
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Plan Deployment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {opportunities?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Coverage Opportunities Found</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Coverage opportunities will appear here when new expansion areas are detected.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
