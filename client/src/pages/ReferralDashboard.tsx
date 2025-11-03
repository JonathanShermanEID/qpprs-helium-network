/**
 * Referral Dashboard
 * Network spreading and viral growth management
 * iPhone XR EXCLUSIVE ACCESS
 * Author: Jonathan Sherman - Monaco Edition
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { 
  Users, 
  Link2,
  Copy,
  Share2,
  TrendingUp,
  DollarSign,
  Network,
  Award,
  Mail,
  MessageSquare
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ReferralDashboard() {
  const [copied, setCopied] = useState(false);

  // Fetch referral data
  const { data: referralCode, isLoading: codeLoading } = trpc.network.generateReferralCode.useQuery();
  const { data: referralStats, isLoading: statsLoading } = trpc.network.getReferralStats.useQuery();
  const { data: socialContent, isLoading: socialLoading } = trpc.network.getSocialContent.useQuery(
    { referralCode: referralCode?.referralCode || '' },
    { enabled: !!referralCode?.referralCode }
  );

  const isLoading = codeLoading || statsLoading;

  const handleCopyLink = () => {
    if (referralCode?.invitationLink) {
      navigator.clipboard.writeText(referralCode.invitationLink);
      setCopied(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin' | 'email') => {
    if (!socialContent) return;
    
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(socialContent.twitter)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralCode?.invitationLink || '')}&quote=${encodeURIComponent(socialContent.facebook)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralCode?.invitationLink || '')}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(socialContent.email.subject)}&body=${encodeURIComponent(socialContent.email.body)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank');
      toast.success(`Sharing on ${platform}!`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading referral dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl bg-card/30">
        <div className="container mx-auto px-6 py-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Referral Network
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Earn rewards by growing the Q++RS network • iPhone XR Exclusive
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Direct Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {referralStats?.directReferrals || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">People you referred</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Network Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {referralStats?.networkSize || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total downstream users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                ${(referralStats?.totalEarnings || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All-time earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">
                ${(referralStats?.pendingRewards || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Ready to claim</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Card */}
        <Card className="mb-8 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              Your Referral Link
            </CardTitle>
            <CardDescription>
              Share this link to earn rewards when people join Q++RS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={referralCode?.invitationLink || ''}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={handleCopyLink} variant="outline">
                {copied ? (
                  <>
                    <Award className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">Your Referral Code:</p>
              <p className="text-2xl font-bold text-primary font-mono">
                {referralCode?.referralCode || 'Loading...'}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" size="sm" onClick={() => handleShare('twitter')}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleShare('facebook')}>
                <Share2 className="w-4 h-4 mr-2" />
                Facebook
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleShare('linkedin')}>
                <Network className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleShare('email')}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reward Structure */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Multi-Level Reward Structure
            </CardTitle>
            <CardDescription>
              Earn from up to 5 levels of referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { level: 1, percentage: 10, description: "Direct referrals" },
                { level: 2, percentage: 5, description: "Their referrals" },
                { level: 3, percentage: 3, description: "Level 3 network" },
                { level: 4, percentage: 2, description: "Level 4 network" },
                { level: 5, percentage: 1, description: "Level 5 network" },
              ].map((tier) => (
                <div key={tier.level} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">{tier.level}</span>
                    </div>
                    <div>
                      <p className="font-medium">Level {tier.level}</p>
                      <p className="text-xs text-muted-foreground">{tier.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-green-500/50 text-green-500">
                    {tier.percentage}% Commission
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              How Referral Rewards Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-blue-500">1</span>
                </div>
                <div>
                  <p className="font-medium mb-1">Share Your Link</p>
                  <p className="text-sm text-muted-foreground">
                    Share your unique referral link with hotspot owners and network operators
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-purple-500">2</span>
                </div>
                <div>
                  <p className="font-medium mb-1">They Join & Earn</p>
                  <p className="text-sm text-muted-foreground">
                    When they sign up and start earning from their hotspots, you earn too
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-green-500">3</span>
                </div>
                <div>
                  <p className="font-medium mb-1">Passive Income</p>
                  <p className="text-sm text-muted-foreground">
                    Earn 10% of their activity plus 5% from their referrals (up to 5 levels deep)
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-yellow-500">4</span>
                </div>
                <div>
                  <p className="font-medium mb-1">Network Growth</p>
                  <p className="text-sm text-muted-foreground">
                    As your network grows, your passive income grows exponentially
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
