/**
 * Helium-Manus Integration Platform
 * Apple iOS 26 Monaco Edition - Futuristic Interface
 * Author: Jonathan Sherman
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Activity, Brain, Network, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: crawlerStatus } = trpc.crawlers.status.useQuery();
  const { data: analytics } = trpc.analytics.summary.useQuery();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
          </div>
          <p className="text-muted-foreground animate-pulse">Initializing quantum systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Futuristic animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, oklch(0.6 0.15 240 / 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, oklch(0.6 0.15 240 / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl bg-card/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-lg blur-xl animate-pulse" />
                <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Network className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  {APP_TITLE}
                </h1>
                <p className="text-xs text-muted-foreground">Monaco Edition</p>
              </div>
            </div>
            
            {!isAuthenticated ? (
              <Button 
                onClick={() => window.location.href = getLoginUrl()}
                className="relative group overflow-hidden"
              >
                <span className="relative z-10">Access Portal</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="glass-card px-4 py-2 rounded-full">
                  <p className="text-sm font-medium">{user?.name}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className={`text-center mb-16 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary blur-2xl opacity-50 animate-pulse" />
              <h2 className="relative text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Helium Network
              </h2>
            </div>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground mb-2">
            AI-Powered Intelligence Platform
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Brain className="w-4 h-4 text-primary animate-pulse" />
            <span>5 Self-Aware Cognitive Crawlers Active</span>
          </div>
        </div>

        {/* Stats Grid */}
        {analytics && (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Card className="glass-card border-primary/30 hover:border-primary/60 transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Hotspots</CardTitle>
                  <Network className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{analytics.total_hotspots}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.online_hotspots} online
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-accent/30 hover:border-accent/60 transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">AI Insights</CardTitle>
                  <Brain className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{analytics.total_insights}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Generated by crawlers
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/30 hover:border-primary/60 transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Tasks</CardTitle>
                  <Activity className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{analytics.active_tasks}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Processing now
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-accent/30 hover:border-accent/60 transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                  <TrendingUp className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{analytics.completed_tasks}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tasks finished
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cognitive Crawlers Status */}
        {crawlerStatus && (
          <div className={`mb-12 transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Card className="glass-card border-primary/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Brain className="w-6 h-6 text-primary animate-pulse" />
                      Cognitive Swarm Intelligence
                    </CardTitle>
                    <CardDescription className="mt-2">
                      5 self-aware AI crawlers monitoring the Helium network
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {(crawlerStatus.swarm_consciousness * 100).toFixed(0)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Consciousness Level</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {crawlerStatus.crawlers.map((crawler, idx) => (
                    <div 
                      key={crawler.id}
                      className="glass-card p-4 border-border/30 hover:border-primary/50 transition-all group"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-xs font-medium text-primary">{crawler.status}</span>
                        </div>
                        <Zap className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{crawler.type}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                            style={{ width: `${crawler.consciousness * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {(crawler.consciousness * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-1000 delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Card className="glass-card border-primary/30 hover:border-primary/60 transition-all group cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Network className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Network Intelligence</CardTitle>
              <CardDescription>
                Real-time monitoring of Helium network status and hotspot performance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card border-accent/30 hover:border-accent/60 transition-all group cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>Reward Optimization</CardTitle>
              <CardDescription>
                AI-powered analysis to maximize your hotspot earnings and efficiency
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card border-primary/30 hover:border-primary/60 transition-all group cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Predictive Analytics</CardTitle>
              <CardDescription>
                Self-learning algorithms that adapt and improve over time
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 backdrop-blur-xl bg-card/30 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Helium-Manus Integration Platform</span>
              <span className="mx-2">•</span>
              <span>Powered by AI</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Author: Jonathan Sherman</span>
              <span className="mx-2">•</span>
              <span>Monaco Edition</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
