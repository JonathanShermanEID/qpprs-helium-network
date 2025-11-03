/**
 * Earnings Analytics Dashboard
 * Comprehensive revenue tracking from all sources
 * iPhone XR EXCLUSIVE ACCESS
 * Author: Jonathan Sherman - Monaco Edition
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  Users,
  Radio,
  CreditCard,
  BarChart3,
  Download,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useState } from "react";

export default function EarningsAnalytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Fetch earnings data from all sources
  const { data: heliumRewards, isLoading: heliumLoading } = trpc.rewards.getEarnings.useQuery({ days: 30 });
  const { data: cryptoAnalytics, isLoading: cryptoLoading } = trpc.cryptoPayments.getAnalyticsSummary.useQuery({});
  const { data: referralData, isLoading: referralLoading } = trpc.network.getReferralStats.useQuery();
  
  // Calculate totals
  const heliumTotal = heliumRewards?.reduce((sum: number, r: any) => sum + parseFloat(r.amount || '0'), 0) || 0;
  const cryptoTotal = parseFloat(cryptoAnalytics?.totalVolumeUSD || '0');
  const referralTotal = referralData?.totalEarnings || 0;
  
  const grandTotal = heliumTotal + cryptoTotal + referralTotal;
  const isLoading = heliumLoading || cryptoLoading || referralLoading;

  // Mock data for demonstration (replace with real data when available)
  const earningsSources = [
    {
      name: "Helium Network Rewards",
      amount: heliumTotal,
      percentage: grandTotal > 0 ? ((heliumTotal / grandTotal) * 100).toFixed(1) : '0',
      change: "+12.5%",
      trend: "up" as "up" | "down",
      icon: Radio,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      name: "Crypto Payments",
      amount: cryptoTotal,
      percentage: grandTotal > 0 ? ((cryptoTotal / grandTotal) * 100).toFixed(1) : '0',
      change: "+8.3%",
      trend: "up" as "up" | "down",
      icon: CreditCard,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      name: "Referral Rewards",
      amount: referralTotal,
      percentage: grandTotal > 0 ? ((referralTotal / grandTotal) * 100).toFixed(1) : '0',
      change: "+25.7%",
      trend: "up" as "up" | "down",
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      name: "ServiceHatch & Ads",
      amount: 0,
      percentage: "0",
      change: "0%",
      trend: "up" as "up" | "down",
      icon: BarChart3,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20"
    }
  ];

  const recentTransactions = [
    ...(heliumRewards?.slice(0, 5).map((r: any) => ({
      id: r.id,
      type: "Helium Reward",
      amount: parseFloat(r.amount || '0'),
      currency: "HNT",
      status: "completed",
      date: new Date(r.timestamp)
    })) || []),
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading earnings data...</p>
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                Earnings Analytics
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Comprehensive revenue tracking • iPhone XR Exclusive
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Total Earnings Card */}
        <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Earnings (30 Days)</p>
                <h2 className="text-5xl font-bold text-foreground mb-2">
                  ${grandTotal.toFixed(2)}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500/30">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15.2% vs last month
                  </Badge>
                </div>
              </div>
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-12 h-12 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === 'all' ? 'All Time' : range.toUpperCase()}
            </Button>
          ))}
        </div>

        {/* Earnings Sources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {earningsSources.map((source) => {
            const Icon = source.icon;
            return (
              <Card key={source.name} className={`${source.borderColor} border-2`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-lg ${source.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${source.color}`} />
                    </div>
                    {source.trend === 'up' && (
                      <Badge variant="outline" className="border-green-500/50 text-green-500">
                        {(source as any).change}
                      </Badge>
                    )}
                    {source.trend === 'down' && (
                      <Badge variant="outline" className="border-red-500/50 text-red-500">
                        {(source as any).change}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground mt-3">
                    {source.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    ${source.amount.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {source.percentage}% of total
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Helium Rewards Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-500" />
                Helium Network Rewards
              </CardTitle>
              <CardDescription>Earnings from your 5 hotspots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total HNT Earned</span>
                  <span className="font-semibold">{heliumTotal.toFixed(4)} HNT</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">USD Value</span>
                  <span className="font-semibold">${heliumTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Hotspots</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg per Hotspot</span>
                  <span className="font-semibold">${(heliumTotal / 5).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Rewards Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Referral Network
              </CardTitle>
              <CardDescription>Multi-level referral earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Direct Referrals</span>
                  <span className="font-semibold">{referralData?.directReferrals || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Network Size</span>
                  <span className="font-semibold">{referralData?.networkSize || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Earned</span>
                  <span className="font-semibold">${referralTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending Rewards</span>
                  <span className="font-semibold">${(referralData?.pendingRewards || 0).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest earnings across all sources</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tx.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.date.toLocaleDateString()} at {tx.date.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-500">
                        +${tx.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">{tx.currency}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your earnings will appear here as your hotspots generate rewards, crypto payments are received, and referrals join your network.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Earnings Tips */}
        <Card className="mt-6 border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="w-5 h-5" />
              Maximize Your Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Ensure all 5 hotspots are online and witnessing other hotspots</li>
              <li>✓ Add your crypto wallets to start accepting Bitcoin and Ethereum payments</li>
              <li>✓ Share your referral link to earn from network growth (10-25% of referral earnings)</li>
              <li>✓ Optimize hotspot placement for better coverage and higher rewards</li>
              <li>✓ Check Network Intelligence Dashboard for coverage opportunities</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
