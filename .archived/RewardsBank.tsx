/**
 * Owner-Only Rewards Banking System
 * Apple iOS 26 Monaco Edition
 * Author: Jonathan Sherman
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowDownToLine, ArrowUpFromLine, Coins, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function RewardsBank() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [mounted, setMounted] = useState(false);

  const { data: balance, isLoading: balanceLoading } = trpc.rewardsBank.balance.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: transactions, isLoading: transactionsLoading } = trpc.rewardsBank.transactions.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Redirect non-owners
    if (isAuthenticated && user && user.openId !== import.meta.env.VITE_OWNER_OPEN_ID) {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-card max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please sign in to access the rewards bank.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (balanceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
          </div>
          <p className="text-muted-foreground animate-pulse">Loading rewards vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Futuristic background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, oklch(0.6 0.15 240 / 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, oklch(0.6 0.15 240 / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl bg-card/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setLocation("/")}>
              ← Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="glass-card px-4 py-2 rounded-full">
                <p className="text-sm font-medium">{user?.name}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Hero */}
        <div
          className={`text-center mb-12 transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary blur-2xl opacity-50 animate-pulse" />
              <h1 className="relative text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent flex items-center gap-4 justify-center">
                <Wallet className="w-12 h-12 text-primary" />
                Rewards Bank
              </h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground">Owner-Only Secure Vault</p>
        </div>

        {/* Balance Cards */}
        {balance && (
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 transition-all duration-1000 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <Card className="glass-card border-primary/30 hover:border-primary/60 transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                  <Coins className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-foreground">{balance.total}</div>
                <p className="text-xs text-muted-foreground mt-1">HNT</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-accent/30 hover:border-accent/60 transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                  <TrendingUp className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-foreground">{balance.completed}</div>
                <p className="text-xs text-muted-foreground mt-1">HNT</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/30 hover:border-primary/60 transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                  <ArrowDownToLine className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-foreground">{balance.pending}</div>
                <p className="text-xs text-muted-foreground mt-1">HNT</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transactions */}
        <div
          className={`transition-all duration-1000 delay-400 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <Card className="glass-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ArrowUpFromLine className="w-6 h-6 text-primary" />
                Transaction History
              </CardTitle>
              <CardDescription>All rewards and transfers</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((tx, idx) => (
                    <div
                      key={tx.id}
                      className="glass-card p-4 border-border/30 hover:border-primary/50 transition-all"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              tx.transactionType === "reward"
                                ? "bg-green-500/20"
                                : tx.transactionType === "withdrawal"
                                ? "bg-red-500/20"
                                : "bg-blue-500/20"
                            }`}
                          >
                            {tx.transactionType === "reward" ? (
                              <ArrowDownToLine className="w-5 h-5 text-green-500" />
                            ) : tx.transactionType === "withdrawal" ? (
                              <ArrowUpFromLine className="w-5 h-5 text-red-500" />
                            ) : (
                              <TrendingUp className="w-5 h-5 text-blue-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground capitalize">{tx.transactionType}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-lg font-bold ${
                              tx.transactionType === "reward" ? "text-green-500" : "text-foreground"
                            }`}
                          >
                            {tx.transactionType === "reward" ? "+" : "-"}
                            {tx.amount} {tx.currency}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">{tx.status}</p>
                        </div>
                      </div>
                      {tx.hotspotId && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Hotspot: {tx.hotspotId.slice(0, 16)}...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
