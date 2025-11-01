/**
 * Hybrid Network Page - Fiber Optic & Cable Infrastructure
 * Author: Jonathan Sherman - Monaco Edition 🏎️
 * 
 * Visualizes fiber optic and cable connections linking LoRa mesh nodes
 * with traditional high-speed infrastructure
 */

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Cable, Wifi, Activity, Zap } from "lucide-react";

export default function HybridNetwork() {
  const { data: topology, isLoading: topologyLoading } = trpc.hybridNetwork.getTopology.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.hybridNetwork.getStats.useQuery();

  if (topologyLoading || statsLoading) {
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
            <Cable className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Hybrid Network Infrastructure</h1>
            <p className="text-blue-300">Fiber Optic & Cable Connections</p>
          </div>
        </div>
        <p className="text-blue-200/80 mt-4">
          High-speed fiber optic and cable connections linking LoRa mesh nodes with traditional infrastructure for complete nationwide coverage.
        </p>
      </div>

      {/* Statistics Overview */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-blue-900/30 backdrop-blur-xl border-blue-400/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-300">Total Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{topology?.total_connections || 0}</div>
            <p className="text-xs text-blue-400 mt-1">Fiber + Cable</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/30 backdrop-blur-xl border-blue-400/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-300">Active Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{topology?.active_connections || 0}</div>
            <p className="text-xs text-blue-400 mt-1">Online Now</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/30 backdrop-blur-xl border-blue-400/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-300">Fiber Optic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.fiber.total || 0}</div>
            <p className="text-xs text-blue-400 mt-1">{stats?.fiber.active || 0} Active</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/30 backdrop-blur-xl border-blue-400/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-300">Cable Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.cable.total || 0}</div>
            <p className="text-xs text-blue-400 mt-1">{stats?.cable.active || 0} Active</p>
          </CardContent>
        </Card>
      </div>

      {/* Fiber Optic Connections */}
      <div className="max-w-7xl mx-auto mb-8">
        <Card className="bg-blue-900/30 backdrop-blur-xl border-blue-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Fiber Optic Backbone
            </CardTitle>
            <CardDescription className="text-blue-300">
              High-speed fiber connections linking major network nodes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topology?.fiber.map((fiber: any) => (
                <div
                  key={fiber.id}
                  className="p-4 rounded-lg bg-blue-950/50 border border-blue-400/20 hover:border-blue-400/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{fiber.name}</h3>
                      <p className="text-sm text-blue-300">
                        {fiber.sourceNodeId} → {fiber.targetNodeId}
                      </p>
                    </div>
                    <Badge
                      variant={fiber.status === "active" ? "default" : "secondary"}
                      className={
                        fiber.status === "active"
                          ? "bg-green-500/20 text-green-400 border-green-400/30"
                          : "bg-gray-500/20 text-gray-400 border-gray-400/30"
                      }
                    >
                      {fiber.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-blue-400">Type</p>
                      <p className="text-white font-medium">{fiber.type}</p>
                    </div>
                    <div>
                      <p className="text-blue-400">Bandwidth</p>
                      <p className="text-white font-medium">{fiber.bandwidth}</p>
                    </div>
                    <div>
                      <p className="text-blue-400">Latency</p>
                      <p className="text-white font-medium">{fiber.latency}</p>
                    </div>
                    <div>
                      <p className="text-blue-400">Distance</p>
                      <p className="text-white font-medium">{fiber.distance}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cable Connections */}
      <div className="max-w-7xl mx-auto">
        <Card className="bg-blue-900/30 backdrop-blur-xl border-blue-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Cable className="w-5 h-5 text-blue-400" />
              Cable Distribution Network
            </CardTitle>
            <CardDescription className="text-blue-300">
              Local area cable connections for last-mile connectivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topology?.cable.map((cable: any) => (
                <div
                  key={cable.id}
                  className="p-4 rounded-lg bg-blue-950/50 border border-blue-400/20 hover:border-blue-400/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{cable.name}</h3>
                      <p className="text-sm text-blue-300">
                        {cable.sourceNodeId} → {cable.targetNodeId}
                      </p>
                    </div>
                    <Badge
                      variant={cable.status === "active" ? "default" : "secondary"}
                      className={
                        cable.status === "active"
                          ? "bg-green-500/20 text-green-400 border-green-400/30"
                          : "bg-gray-500/20 text-gray-400 border-gray-400/30"
                      }
                    >
                      {cable.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-blue-400">Type</p>
                      <p className="text-white font-medium">{cable.type.toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-blue-400">Bandwidth</p>
                      <p className="text-white font-medium">{cable.bandwidth}</p>
                    </div>
                    <div>
                      <p className="text-blue-400">Distance</p>
                      <p className="text-white font-medium">{cable.distance}</p>
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
