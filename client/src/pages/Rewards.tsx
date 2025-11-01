/**
 * Rewards Optimization Page
 * Author: Jonathan Sherman
 * Monaco Edition 🏎️
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Coins, Zap, Target } from "lucide-react";
import { useLocation } from "wouter";

export default function Rewards() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-card max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access Rewards Optimization</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Reward Optimization
              </h1>
              <p className="text-sm text-muted-foreground">AI-powered earnings maximization</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card border-accent/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Rewards</CardTitle>
                <Coins className="w-4 h-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">1,247.89 HNT</div>
              <p className="text-xs text-muted-foreground mt-1">+12.4% this month</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Optimization Score</CardTitle>
                <Target className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">94%</div>
              <p className="text-xs text-muted-foreground mt-1">Excellent performance</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-accent/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Potential Increase</CardTitle>
                <Zap className="w-4 h-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">+18%</div>
              <p className="text-xs text-muted-foreground mt-1">With AI suggestions</p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card border-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              AI Optimization Recommendations
            </CardTitle>
            <CardDescription>
              Powered by 409 AI error fixers and 40 cognitive crawlers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Optimize Antenna Placement", impact: "+8% rewards", priority: "High" },
                { title: "Adjust Transmission Power", impact: "+5% rewards", priority: "Medium" },
                { title: "Update Firmware", impact: "+3% rewards", priority: "Medium" },
                { title: "Improve Network Connectivity", impact: "+2% rewards", priority: "Low" },
              ].map((recommendation, idx) => (
                <div
                  key={idx}
                  className="glass-card p-4 border-border/30 hover:border-accent/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">{recommendation.title}</h3>
                      <p className="text-sm text-muted-foreground">{recommendation.impact}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      recommendation.priority === 'High' ? 'bg-red-500/20 text-red-500' :
                      recommendation.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-green-500/20 text-green-500'
                    }`}>
                      {recommendation.priority}
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
