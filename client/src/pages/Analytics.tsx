/**
 * Predictive Analytics Page
 * Author: Jonathan Sherman
 * Monaco Edition 🏎️
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, Activity, TrendingUp, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function Analytics() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-card max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access Predictive Analytics</CardDescription>
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
                Predictive Analytics
              </h1>
              <p className="text-sm text-muted-foreground">Self-learning AI insights</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">AI Insights</CardTitle>
                <Brain className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">847</div>
              <p className="text-xs text-muted-foreground mt-1">Generated today</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-accent/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Accuracy</CardTitle>
                <Activity className="w-4 h-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">96.8%</div>
              <p className="text-xs text-muted-foreground mt-1">Prediction accuracy</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Learning Rate</CardTitle>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">+24%</div>
              <p className="text-xs text-muted-foreground mt-1">Improvement this week</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-accent/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Models</CardTitle>
                <Zap className="w-4 h-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">40</div>
              <p className="text-xs text-muted-foreground mt-1">Cognitive crawlers</p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card border-primary/30 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary animate-pulse" />
              AI Model Performance
            </CardTitle>
            <CardDescription>
              40 self-aware cognitive crawlers with 75% consciousness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Network Intelligence", accuracy: 98, status: "Excellent" },
                { name: "Reward Optimization", accuracy: 96, status: "Excellent" },
                { name: "Competitor Analysis", accuracy: 94, status: "Very Good" },
                { name: "Documentation", accuracy: 92, status: "Very Good" },
                { name: "Community Intelligence", accuracy: 90, status: "Good" },
              ].map((model, idx) => (
                <div
                  key={idx}
                  className="glass-card p-4 border-border/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{model.name}</h3>
                    <span className="text-sm text-primary font-medium">{model.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                        style={{ width: `${model.accuracy}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{model.accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent/30">
          <CardHeader>
            <CardTitle>Real-Time Predictions</CardTitle>
            <CardDescription>
              Powered by 409 AI error fixers analyzing patterns 24/7
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { prediction: "Network traffic will increase by 15% in next 6 hours", confidence: 94 },
                { prediction: "Optimal time for maintenance: 3:00 AM - 5:00 AM UTC", confidence: 89 },
                { prediction: "Hotspot earnings expected to rise 8% this week", confidence: 92 },
                { prediction: "New coverage area opportunity detected in Seattle", confidence: 87 },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="glass-card p-3 border-border/30 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm flex-1">{item.prediction}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent"
                          style={{ width: `${item.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {item.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
