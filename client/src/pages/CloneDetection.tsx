/**
 * Clone Detection Dashboard
 * Author: Jonathan Sherman - Monaco Edition
 * 
 * Monitor and manage clone detection attempts
 * iPhone XR EXCLUSIVE ACCESS
 */

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, CheckCircle, XCircle, Ban, Smartphone } from "lucide-react";

export default function CloneDetection() {
  const [selectedTab, setSelectedTab] = useState<'attempts' | 'blocked' | 'authentic' | 'stats'>('attempts');
  
  // Fetch data
  const attemptsQuery = trpc.cloneDetection.getAttempts.useQuery({ limit: 50, offset: 0 });
  const blockedQuery = trpc.cloneDetection.getBlockedDevices.useQuery();
  const authenticQuery = trpc.cloneDetection.getAuthenticDevices.useQuery();
  const statsQuery = trpc.cloneDetection.getStats.useQuery({ days: 30 });

  const attempts = attemptsQuery.data || [];
  const blocked = blockedQuery.data || [];
  const authentic = authenticQuery.data || [];
  const stats = statsQuery.data || [];

  // Calculate summary statistics
  const totalAttempts = stats.reduce((sum: number, s: any) => sum + s.totalAttempts, 0);
  const totalBlocked = stats.reduce((sum: number, s: any) => sum + s.blockedAttempts, 0);
  const totalAuthentic = stats.reduce((sum: number, s: any) => sum + s.authenticAttempts, 0);
  const blockRate = totalAttempts > 0 ? ((totalBlocked / totalAttempts) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Clone Detection System</h1>
              <p className="text-blue-300">Advanced device authentication and clone blocking</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-300">Total Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalAttempts}</div>
              <p className="text-xs text-blue-400 mt-1">Last 30 days</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-red-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-300">Blocked Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalBlocked}</div>
              <p className="text-xs text-red-400 mt-1">{blockRate}% block rate</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-300">Authentic Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalAuthentic}</div>
              <p className="text-xs text-green-400 mt-1">{authentic.length} registered</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-300">Active Blocks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{blocked.length}</div>
              <p className="text-xs text-purple-400 mt-1">Permanently blocked</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="glass-card p-2">
          <div className="flex gap-2">
            <Button
              variant={selectedTab === 'attempts' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('attempts')}
              className="flex-1"
            >
              Detection Attempts
            </Button>
            <Button
              variant={selectedTab === 'blocked' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('blocked')}
              className="flex-1"
            >
              Blocked Devices
            </Button>
            <Button
              variant={selectedTab === 'authentic' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('authentic')}
              className="flex-1"
            >
              Authentic Devices
            </Button>
            <Button
              variant={selectedTab === 'stats' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('stats')}
              className="flex-1"
            >
              Statistics
            </Button>
          </div>
        </div>

        {/* Content */}
        {selectedTab === 'attempts' && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Recent Detection Attempts</CardTitle>
              <CardDescription className="text-blue-300">
                All device authentication attempts (last 50)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attempts.map((attempt: any) => (
                  <div key={attempt.id} className="glass-card p-4 border border-blue-500/20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {attempt.deviceType === 'authentic' ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                          <Badge variant={attempt.isBlocked ? 'destructive' : 'default'}>
                            {attempt.deviceType}
                          </Badge>
                          <span className="text-sm text-blue-300">
                            Confidence: {attempt.confidence}%
                          </span>
                        </div>
                        <div className="text-xs text-blue-400 space-y-1">
                          <div>Platform: {attempt.platform}</div>
                          <div>Resolution: {attempt.screenResolution}</div>
                          <div>IP: {attempt.ipAddress || 'Unknown'}</div>
                          <div>Time: {new Date(attempt.timestamp).toLocaleString()}</div>
                        </div>
                        {attempt.reasons && attempt.reasons.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs font-semibold text-red-300 mb-1">Detection Reasons:</div>
                            <ul className="text-xs text-red-400 space-y-1">
                              {attempt.reasons.map((reason: string, idx: number) => (
                                <li key={idx}>• {reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {attempt.isBlocked && (
                        <Badge variant="destructive" className="ml-4">
                          <Ban className="w-3 h-3 mr-1" />
                          BLOCKED
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {attempts.length === 0 && (
                  <div className="text-center py-8 text-blue-400">
                    No detection attempts recorded
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTab === 'blocked' && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Blocked Devices</CardTitle>
              <CardDescription className="text-blue-300">
                Permanently blocked clones and emulators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blocked.map((device: any) => (
                  <div key={device.id} className="glass-card p-4 border border-red-500/20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Ban className="w-5 h-5 text-red-400" />
                          <Badge variant="destructive">{device.deviceType}</Badge>
                          <span className="text-sm text-red-300">
                            {device.attemptCount} attempts
                          </span>
                        </div>
                        <div className="text-xs text-blue-400 space-y-1">
                          <div>Fingerprint: {device.fingerprint.substring(0, 16)}...</div>
                          <div>First: {new Date(device.firstAttempt).toLocaleString()}</div>
                          <div>Last: {new Date(device.lastAttempt).toLocaleString()}</div>
                          <div>Reason: {device.blockReason}</div>
                          {device.ipAddresses && device.ipAddresses.length > 0 && (
                            <div>IPs: {device.ipAddresses.join(', ')}</div>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-4 border-red-500/50 text-red-300">
                        PERMANENT
                      </Badge>
                    </div>
                  </div>
                ))}
                {blocked.length === 0 && (
                  <div className="text-center py-8 text-blue-400">
                    No blocked devices
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTab === 'authentic' && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Authentic Devices</CardTitle>
              <CardDescription className="text-blue-300">
                Registered and verified authentic devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {authentic.map((device: any) => (
                  <div key={device.id} className="glass-card p-4 border border-green-500/20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Smartphone className="w-5 h-5 text-green-400" />
                          <span className="text-white font-semibold">{device.deviceName}</span>
                          <Badge variant="outline" className="border-green-500/50 text-green-300">
                            {device.deviceModel}
                          </Badge>
                        </div>
                        <div className="text-xs text-blue-400 space-y-1">
                          <div>Owner: {device.ownerName}</div>
                          {device.phoneNumber && <div>Phone: {device.phoneNumber}</div>}
                          <div>Fingerprint: {device.fingerprint.substring(0, 16)}...</div>
                          <div>Registered: {new Date(device.registeredAt).toLocaleString()}</div>
                          <div>Last Verified: {new Date(device.lastVerified).toLocaleString()}</div>
                          <div>Verifications: {device.verificationCount}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-4 border-green-500/50 text-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        VERIFIED
                      </Badge>
                    </div>
                  </div>
                ))}
                {authentic.length === 0 && (
                  <div className="text-center py-8 text-blue-400">
                    No authentic devices registered
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTab === 'stats' && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Detection Statistics</CardTitle>
              <CardDescription className="text-blue-300">
                Daily statistics for the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.map((stat: any) => (
                  <div key={stat.id} className="glass-card p-4 border border-blue-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">
                        {new Date(stat.date).toLocaleDateString()}
                      </span>
                      <Badge variant="outline" className="border-blue-500/50 text-blue-300">
                        {stat.totalAttempts} attempts
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <div className="text-green-400">Authentic</div>
                        <div className="text-white font-semibold">{stat.authenticAttempts}</div>
                      </div>
                      <div>
                        <div className="text-red-400">Clones</div>
                        <div className="text-white font-semibold">{stat.cloneAttempts}</div>
                      </div>
                      <div>
                        <div className="text-orange-400">Emulators</div>
                        <div className="text-white font-semibold">{stat.emulatorAttempts}</div>
                      </div>
                      <div>
                        <div className="text-purple-400">VMs</div>
                        <div className="text-white font-semibold">{stat.vmAttempts}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-blue-400">
                      Avg Confidence: {stat.averageConfidence}% | Blocked: {stat.blockedAttempts}
                    </div>
                  </div>
                ))}
                {stats.length === 0 && (
                  <div className="text-center py-8 text-blue-400">
                    No statistics available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alert */}
        <Alert className="glass-card border-yellow-500/20">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-300">
            <strong>iPhone XR Exclusive:</strong> Only your authenticated iPhone XR device can access this dashboard.
            All clone detection and blocking is automatic and permanent.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
