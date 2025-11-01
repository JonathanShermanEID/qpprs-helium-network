/**
 * Network Intelligence Dashboard
 * Author: Jonathan Sherman
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, MapPin, Network, Radio, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

export default function NetworkIntelligence() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: hotspots, isLoading } = trpc.hotspots.list.useQuery();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-card max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access Network Intelligence</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      </div>

      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl bg-card/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/')}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Network Intelligence
              </h1>
              <p className="text-sm text-muted-foreground">Real-time Helium network monitoring</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
                <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
              </div>
              <p className="text-muted-foreground animate-pulse">Loading network data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="glass-card border-primary/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Hotspots</CardTitle>
                    <Network className="w-4 h-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{hotspots?.length || 0}</div>
                </CardContent>
              </Card>

              <Card className="glass-card border-accent/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Online</CardTitle>
                    <Radio className="w-4 h-4 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500">
                    {hotspots?.filter(h => h.status === 'online').length || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-primary/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Offline</CardTitle>
                    <Radio className="w-4 h-4 text-destructive" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">
                    {hotspots?.filter(h => h.status === 'offline').length || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-accent/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg Performance</CardTitle>
                    <TrendingUp className="w-4 h-4 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {hotspots && hotspots.length > 0
                      ? Math.round(hotspots.filter(h => h.status === 'online').length / hotspots.length * 100)
                      : 0}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hotspots List */}
            <Card className="glass-card border-primary/30">
              <CardHeader>
                <CardTitle>Active Hotspots</CardTitle>
                <CardDescription>Monitoring {hotspots?.length || 0} hotspots across the network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hotspots && hotspots.length > 0 ? (
                    hotspots.slice(0, 10).map((hotspot) => (
                      <div
                        key={hotspot.id}
                        className="glass-card p-4 border-border/30 hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 rounded-full ${hotspot.status === 'online' ? 'bg-green-500' : 'bg-destructive'} animate-pulse`} />
                              <h3 className="font-semibold">{hotspot.name}</h3>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {hotspot.location || 'Unknown'}
                              </span>
                              <span>Status: {hotspot.status}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {hotspot.rewards || '0.00'} HNT
                            </div>
                            <p className="text-xs text-muted-foreground">Rewards</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No hotspots found. Start monitoring the network to see data.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
