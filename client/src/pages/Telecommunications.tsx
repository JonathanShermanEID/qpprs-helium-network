/**
 * Telecommunications Page - Voice, Text & Data Services
 * Author: Jonathan Sherman - Monaco Edition 🏎️
 * 
 * Manages voice, text (SMS), and data provisioning for complete
 * telecommunications capabilities over the hybrid mesh network
 */

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Phone, MessageSquare, Database, Signal } from "lucide-react";

export default function Telecommunications() {
  const { data: overview, isLoading: overviewLoading } = trpc.telecom.overview.useQuery();
  const { data: voiceStats, isLoading: voiceLoading } = trpc.telecom.voice.stats.useQuery();
  const { data: textStats, isLoading: textLoading } = trpc.telecom.text.stats.useQuery();
  const { data: dataStats, isLoading: dataLoading } = trpc.telecom.data.stats.useQuery();
  const { data: voiceAccounts } = trpc.telecom.voice.list.useQuery();
  const { data: textAccounts } = trpc.telecom.text.list.useQuery();
  const { data: dataAccounts } = trpc.telecom.data.list.useQuery();

  if (overviewLoading || voiceLoading || textLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950">
        <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 backdrop-blur-xl border border-blue-400/30 flex items-center justify-center">
            <Signal className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Telecommunications Services</h1>
            <p className="text-blue-300">Voice, Text & Data Provisioning</p>
          </div>
        </div>
        <p className="text-blue-200/80 mt-4">
          Complete telecommunications capabilities over the hybrid mesh network. Voice calls, SMS/MMS messaging, and high-speed data services.
        </p>
      </div>

      {/* Overview Statistics */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-blue-900/30 backdrop-blur-xl border-blue-400/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-300">Total Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{overview?.total_services || 0}</div>
            <p className="text-xs text-blue-400 mt-1">Voice + Text + Data</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/30 backdrop-blur-xl border-blue-400/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-300">Voice Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{overview?.voice.active || 0}</div>
            <p className="text-xs text-blue-400 mt-1">of {overview?.voice.total || 0} accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/30 backdrop-blur-xl border-blue-400/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-300">Text Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">{overview?.text.active || 0}</div>
            <p className="text-xs text-blue-400 mt-1">of {overview?.text.total || 0} accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/30 backdrop-blur-xl border-blue-400/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-300">Data Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">{overview?.data.active || 0}</div>
            <p className="text-xs text-blue-400 mt-1">of {overview?.data.total || 0} accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Voice Services */}
      <div className="max-w-7xl mx-auto mb-8">
        <Card className="bg-blue-900/30 backdrop-blur-xl border-blue-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-400" />
              Voice Services
            </CardTitle>
            <CardDescription className="text-blue-300">
              VoIP and traditional voice calling with {voiceStats?.total_minutes_used.toLocaleString() || 0} minutes used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {voiceAccounts?.map((account: any) => (
                <div
                  key={account.id}
                  className="p-4 rounded-lg bg-blue-950/50 border border-blue-400/20 hover:border-blue-400/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{account.phoneNumber}</h3>
                      <p className="text-sm text-blue-300">{account.plan}</p>
                    </div>
                    <Badge
                      variant={account.status === "active" ? "default" : "secondary"}
                      className={
                        account.status === "active"
                          ? "bg-green-500/20 text-green-400 border-green-400/30"
                          : "bg-red-500/20 text-red-400 border-red-400/30"
                      }
                    >
                      {account.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-400">Minutes Used</span>
                      <span className="text-white font-medium">
                        {account.minutesUsed.toLocaleString()} / {account.minutesAllowed === 999999 ? "∞" : account.minutesAllowed.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-400">VoIP</span>
                      <span className="text-white font-medium">{account.voipEnabled ? "Enabled" : "Disabled"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Text/SMS Services */}
      <div className="max-w-7xl mx-auto mb-8">
        <Card className="bg-blue-900/30 backdrop-blur-xl border-blue-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              Text/SMS Services
            </CardTitle>
            <CardDescription className="text-blue-300">
              SMS and MMS messaging with {textStats?.total_messages_sent.toLocaleString() || 0} messages sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {textAccounts?.map((account: any) => (
                <div
                  key={account.id}
                  className="p-4 rounded-lg bg-blue-950/50 border border-blue-400/20 hover:border-blue-400/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{account.phoneNumber}</h3>
                      <p className="text-sm text-blue-300">Text Messaging</p>
                    </div>
                    <Badge
                      variant={account.status === "active" ? "default" : "secondary"}
                      className={
                        account.status === "active"
                          ? "bg-green-500/20 text-green-400 border-green-400/30"
                          : "bg-red-500/20 text-red-400 border-red-400/30"
                      }
                    >
                      {account.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-400">Messages</span>
                      <span className="text-white font-medium">
                        {account.messagesUsed.toLocaleString()} / {account.messagesAllowed === 999999 ? "∞" : account.messagesAllowed.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-400">SMS</span>
                      <span className="text-white font-medium">{account.smsEnabled ? "✓" : "✗"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-400">MMS</span>
                      <span className="text-white font-medium">{account.mmsEnabled ? "✓" : "✗"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Services */}
      <div className="max-w-7xl mx-auto">
        <Card className="bg-blue-900/30 backdrop-blur-xl border-blue-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              Data Services
            </CardTitle>
            <CardDescription className="text-blue-300">
              High-speed data with QoS prioritization across the hybrid network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dataAccounts?.map((account: any) => (
                <div
                  key={account.id}
                  className="p-4 rounded-lg bg-blue-950/50 border border-blue-400/20 hover:border-blue-400/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">User {account.userId}</h3>
                      <p className="text-sm text-blue-300">{account.plan}</p>
                    </div>
                    <Badge
                      variant={account.status === "active" ? "default" : "secondary"}
                      className={
                        account.status === "active"
                          ? "bg-green-500/20 text-green-400 border-green-400/30"
                          : "bg-red-500/20 text-red-400 border-red-400/30"
                      }
                    >
                      {account.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-400">Data Usage</span>
                      <span className="text-white font-medium">
                        {account.dataUsed} / {account.dataAllowed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-400">Speed</span>
                      <span className="text-white font-medium">{account.speed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-400">QoS Level</span>
                      <Badge
                        variant="outline"
                        className={
                          account.qosLevel === "high"
                            ? "bg-green-500/20 text-green-400 border-green-400/30"
                            : account.qosLevel === "medium"
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
                            : "bg-gray-500/20 text-gray-400 border-gray-400/30"
                        }
                      >
                        {account.qosLevel}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 text-center text-blue-300/60 text-sm">
        <p>Monaco Edition 🏎️ | Authored by Jonathan Sherman</p>
      </div>
    </div>
  );
}
