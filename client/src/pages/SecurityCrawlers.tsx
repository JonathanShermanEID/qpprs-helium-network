/**
 * Security Crawlers Dashboard
 * Monitor 20 Creative Cognition Web Crawler LLMs
 * iPhone XR EXCLUSIVE ACCESS
 * Author: Jonathan Sherman - Monaco Edition
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  Lock,
  Eye,
  RefreshCw,
  Play
} from "lucide-react";
import { toast } from "sonner";

export default function SecurityCrawlers() {
  const { data: status, isLoading, refetch } = trpc.securityCrawlers.getStatus.useQuery();
  const { data: events } = trpc.securityCrawlers.getEvents.useQuery({ limit: 20 });
  const { data: rules } = trpc.securityCrawlers.getProtectionRules.useQuery();
  
  const triggerScan = trpc.securityCrawlers.triggerScan.useMutation({
    onSuccess: () => {
      toast.success("Manual security scan triggered");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Scan failed: ${error.message}`);
    }
  });

  const resumeProduction = trpc.securityCrawlers.resumeProduction.useMutation({
    onSuccess: () => {
      toast.success("Production resumed successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Resume failed: ${error.message}`);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading security status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl bg-card/30">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                Security Crawlers
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                20 Creative Cognition LLMs • 24/7 Protection • iPhone XR Exclusive
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetch()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => triggerScan.mutate()}
                disabled={triggerScan.isPending}
              >
                <Zap className="w-4 h-4 mr-2" />
                Manual Scan
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Production Status Alert */}
        {status?.productionHalted && (
          <Card className="mb-8 border-2 border-red-500 bg-red-500/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-red-500" />
                  <div>
                    <CardTitle className="text-red-500">🚨 PRODUCTION HALTED 🚨</CardTitle>
                    <CardDescription className="text-red-400">
                      Critical security challenge detected
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => resumeProduction.mutate({ reason: "Manual override by owner" })}
                  disabled={resumeProduction.isPending}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume Production
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                <strong>Reason:</strong> {status.haltReason}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Production Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {status?.productionHalted ? (
                  <>
                    <XCircle className="w-8 h-8 text-red-500" />
                    <div>
                      <div className="text-2xl font-bold text-red-500">HALTED</div>
                      <p className="text-xs text-muted-foreground">Security challenge</p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold text-green-500">ACTIVE</div>
                      <p className="text-xs text-muted-foreground">All systems operational</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Crawlers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {status?.activeCrawlers || 0} / 20
              </div>
              <p className="text-xs text-muted-foreground mt-1">LLM agents monitoring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Threats Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {status?.totalThreatsDetected || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All-time detections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Protection Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {status?.activeProtectionRules || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Auto-deployed</p>
            </CardContent>
          </Card>
        </div>

        {/* 20 Crawler Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              20 Creative Cognition Crawler LLMs
            </CardTitle>
            <CardDescription>
              Specialized AI agents monitoring different security aspects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {status?.crawlers.map((crawler: any) => (
                <div
                  key={crawler.id}
                  className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Activity className={`w-4 h-4 ${crawler.active ? 'text-green-500 animate-pulse' : 'text-gray-500'}`} />
                      <span className="font-semibold text-sm">#{crawler.id}</span>
                    </div>
                    <Badge variant={crawler.threatsDetected > 0 ? 'destructive' : 'outline'} className="text-xs">
                      {crawler.threatsDetected} threats
                    </Badge>
                  </div>
                  <h4 className="font-medium text-sm mb-1">{crawler.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{crawler.specialty}</p>
                  <p className="text-xs text-muted-foreground">
                    Last scan: {new Date(crawler.lastScan).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Security Events */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Recent Security Events
            </CardTitle>
            <CardDescription>Latest threat detections and mitigations</CardDescription>
          </CardHeader>
          <CardContent>
            {events && events.length > 0 ? (
              <div className="space-y-3">
                {events.map((event: any) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-semibold text-sm">{event.crawlerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          event.threatLevel === 'critical' || event.threatLevel === 'production_halt' 
                            ? 'destructive' 
                            : event.threatLevel === 'high'
                            ? 'default'
                            : 'outline'
                        }
                      >
                        {event.threatLevel}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">
                      <strong>Threat:</strong> {event.threatType}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                    {event.mitigationDeployed && (
                      <p className="text-xs text-green-500">
                        ✓ {event.mitigationDetails}
                      </p>
                    )}
                    {event.productionHalted && (
                      <p className="text-xs text-red-500 font-semibold mt-2">
                        🚨 PRODUCTION HALTED
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Security Events</h3>
                <p className="text-muted-foreground">
                  All 20 crawler LLMs are monitoring - no threats detected
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Protection Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-500" />
              Active Protection Rules
            </CardTitle>
            <CardDescription>Auto-deployed security rules</CardDescription>
          </CardHeader>
          <CardContent>
            {rules && rules.length > 0 ? (
              <div className="space-y-3">
                {rules.map((rule: any) => (
                  <div
                    key={rule.id}
                    className="p-4 rounded-lg border border-border/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-sm">{rule.name}</p>
                      <Badge variant="outline">{rule.action}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Type: {rule.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Deployed: {new Date(rule.deployedAt).toLocaleString()} by {rule.deployedBy}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No protection rules deployed yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
