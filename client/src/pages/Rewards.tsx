/**
 * Rewards Optimization Page
 * HNT to Manus Credits Conversion
 * Author: Jonathan Sherman
 * Monaco Edition 🏎️
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, TrendingUp, Coins, Zap, Target, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Rewards() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isConverting, setIsConverting] = useState(false);

  const { data: balance, refetch: refetchBalance } = trpc.rewards.getBalance.useQuery();
  
  const { data: stats } = trpc.rewards.getStats.useQuery();
  
  const { data: history } = trpc.rewards.getConversionHistory.useQuery({ limit: 5 });

  const convertMutation = trpc.rewards.convertToCredits.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Successfully converted ${data.conversion.hntAmount} HNT to ${data.conversion.creditsAmount} Manus credits!`,
        {
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        }
      );
      refetchBalance();
      setIsConverting(false);
    },
    onError: (error) => {
      toast.error(`Conversion failed: ${error.message}`);
      setIsConverting(false);
    },
  });

  const handleConvertAll = () => {
    if (!balance || balance.hnt === 0) {
      toast.error("No HNT available to convert");
      return;
    }

    setIsConverting(true);
    convertMutation.mutate({ hntAmount: balance.hnt });
  };

  // Public access - no authentication required

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
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
              <p className="text-sm text-muted-foreground">Convert HNT to Manus Credits</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Conversion Card - Main Feature */}
        <Card className="glass-card border-accent/50 mb-8 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Coins className="w-6 h-6 text-accent animate-pulse" />
              HNT Rewards Converter
            </CardTitle>
            <CardDescription>
              Click the box below to convert all your Helium Network rewards to Manus credits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* HNT Balance Box */}
              <Card className="glass-card border-primary/30 hover:border-primary/60 transition-all hover:scale-105 cursor-pointer">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Coins className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">HNT Balance</p>
                    <div className="text-4xl font-bold text-primary">
                      {balance?.hnt.toFixed(2) || '0.00'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Helium Network Tokens</p>
                  </div>
                </CardContent>
              </Card>

              {/* Conversion Arrow */}
              <div className="flex flex-col items-center justify-center">
                <Button
                  onClick={handleConvertAll}
                  disabled={!balance || balance.hnt === 0 || isConverting}
                  size="lg"
                  className="relative group/btn overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isConverting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        Convert All
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent via-primary to-accent opacity-0 group-hover/btn:opacity-100 transition-opacity blur-xl" />
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Rate: 1 HNT = {balance?.conversionRate || 50} credits
                </p>
              </div>

              {/* Manus Credits Box - Clickable */}
              <Card 
                className="glass-card border-accent/30 hover:border-accent/60 transition-all hover:scale-105 cursor-pointer"
                onClick={handleConvertAll}
              >
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Zap className="w-8 h-8 text-accent" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Estimated Credits</p>
                    <div className="text-4xl font-bold text-accent">
                      {balance?.estimatedCredits.toFixed(0) || '0'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Manus Credits</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-accent/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Current Credits</CardTitle>
                <Zap className="w-4 h-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{balance?.credits.toFixed(0) || '0'}</div>
              <p className="text-xs text-muted-foreground mt-1">Available now</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Conversions</CardTitle>
                <Target className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats?.totalConversions || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-accent/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">HNT Converted</CardTitle>
                <Coins className="w-4 h-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{stats?.totalHntConverted.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground mt-1">Total HNT</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Credits Earned</CardTitle>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats?.totalCreditsEarned.toFixed(0) || '0'}</div>
              <p className="text-xs text-muted-foreground mt-1">Lifetime total</p>
            </CardContent>
          </Card>
        </div>

        {/* Conversion History */}
        <Card className="glass-card border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Conversions
            </CardTitle>
            <CardDescription>
              Your latest HNT to Manus credits conversions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history && history.length > 0 ? (
              <div className="space-y-3">
                {history.map((conversion) => (
                  <div
                    key={conversion.id}
                    className="glass-card p-4 border-border/30 hover:border-accent/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold">
                            {conversion.hntAmount.toFixed(2)} HNT → {conversion.creditsAmount.toFixed(0)} Credits
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(conversion.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          conversion.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                          conversion.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {conversion.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Coins className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No conversions yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Convert your HNT rewards to start earning Manus credits
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
