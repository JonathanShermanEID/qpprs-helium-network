/**
 * Conversation Monitoring & Recovery Dashboard
 * Author: Jonathan Sherman - Monaco Edition
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Database, Clock, AlertTriangle, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useScreenLockDetection } from "@/hooks/useScreenLockDetection";
// Use owner OpenId from environment
const OWNER_OPEN_ID = import.meta.env.VITE_OWNER_OPEN_ID || "";

export default function ConversationMonitor() {
  const [scanning, setScanning] = useState(false);

  // Queries
  const { data: authorshipChanges, refetch: refetchChanges } = trpc.conversationMonitor.getAuthorshipChanges.useQuery();
  const { data: backups, refetch: refetchBackups } = trpc.conversationMonitor.getBackups.useQuery({ limit: 50 });
  const { data: scanHistory, refetch: refetchScans } = trpc.conversationMonitor.getScanHistory.useQuery();

  // Mutations
  const scanMutation = trpc.conversationMonitor.scanConversations.useMutation();
  const restoreMutation = trpc.conversationMonitor.restoreConversation.useMutation();

  // Screen lock detection (auto-backup)
  const { deviceId } = useScreenLockDetection({
    enabled: true,
    userOpenId: OWNER_OPEN_ID,
    onScreenLock: () => {
      toast.info("Screen locked - Triggering automatic backup...");
    },
  });

  // Scan conversations
  const handleScan = async () => {
    setScanning(true);
    try {
      const result = await scanMutation.mutateAsync({
        userOpenId: OWNER_OPEN_ID,
        scanType: "full_scan",
      });

      toast.success(
        `Scan complete! ${result.conversationsScanned} conversations scanned, ${result.backupsCreated} backups created, ${result.authorshipChangesFound} authorship changes detected.`
      );

      // Refresh data
      refetchChanges();
      refetchBackups();
      refetchScans();
    } catch (error) {
      toast.error(`Scan failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setScanning(false);
    }
  };

  // Restore conversation
  const handleRestore = async (changeId: number) => {
    try {
      const result = await restoreMutation.mutateAsync({
        authorshipChangeId: changeId,
      });

      toast.success(`Conversation restored from ${new Date(result.restoredFrom).toLocaleString()}`);
      refetchChanges();
    } catch (error) {
      toast.error(`Restore failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-blue-400" />
            Conversation Monitor
          </h1>
          <p className="text-slate-400">
            Automatic backup and authorship protection for your Manus conversations
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Device ID: {deviceId} | Screen lock detection: Active
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/50 border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Total Backups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{backups?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-orange-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Authorship Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">{authorshipChanges?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Scans Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{scanHistory?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Auto-Backups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">
                {backups?.filter(b => b.backupTrigger === "screen_lock").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scan Button */}
        <div className="mb-8">
          <Button
            onClick={handleScan}
            disabled={scanning}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {scanning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Scan Conversations Now
              </>
            )}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="changes" className="space-y-6">
          <TabsList className="bg-slate-900/50">
            <TabsTrigger value="changes">Authorship Changes</TabsTrigger>
            <TabsTrigger value="backups">Backups</TabsTrigger>
            <TabsTrigger value="scans">Scan History</TabsTrigger>
          </TabsList>

          {/* Authorship Changes */}
          <TabsContent value="changes">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Detected Authorship Changes</CardTitle>
                <CardDescription>Conversations where authorship has been modified</CardDescription>
              </CardHeader>
              <CardContent>
                {!authorshipChanges || authorshipChanges.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
                    <p>No authorship changes detected</p>
                    <p className="text-sm mt-2">All conversations are secure</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {authorshipChanges.map((change) => (
                      <Card key={change.id} className="bg-slate-800/50 border-orange-500/30">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                <h3 className="font-semibold text-white">
                                  Conversation: {change.conversationId}
                                </h3>
                              </div>
                              <div className="space-y-1 text-sm">
                                <p className="text-slate-400">
                                  Original: {change.originalAuthor.name} ({change.originalAuthor.openId})
                                </p>
                                <p className="text-orange-400">
                                  Changed to: {change.newAuthor.name} ({change.newAuthor.openId})
                                </p>
                                <p className="text-slate-500">
                                  Detected: {new Date(change.changeDetectedAt).toLocaleString()}
                                </p>
                              </div>
                              <div className="mt-3">
                                <Badge
                                  variant={
                                    change.restorationStatus === "restored"
                                      ? "default"
                                      : change.restorationStatus === "failed"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {change.restorationStatus}
                                </Badge>
                              </div>
                            </div>
                            {change.restorationStatus === "pending" && (
                              <Button
                                onClick={() => handleRestore(change.id)}
                                disabled={restoreMutation.isPending}
                                variant="outline"
                                size="sm"
                              >
                                Restore Original
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backups */}
          <TabsContent value="backups">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Conversation Backups</CardTitle>
                <CardDescription>All backed up conversations</CardDescription>
              </CardHeader>
              <CardContent>
                {!backups || backups.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Database className="w-16 h-16 mx-auto mb-4" />
                    <p>No backups yet</p>
                    <p className="text-sm mt-2">Click "Scan Conversations Now" to create backups</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {backups.map((backup) => (
                      <Card key={backup.id} className="bg-slate-800/50 border-slate-600">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white mb-1">
                                {backup.conversationTitle || "Untitled"}
                              </h3>
                              <div className="space-y-1 text-sm text-slate-400">
                                <p>Author: {backup.authorName}</p>
                                <p>Messages: {backup.messageCount}</p>
                                <p className="flex items-center gap-2">
                                  <Clock className="w-3 h-3" />
                                  {new Date(backup.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <Badge variant="outline" className="mt-2">
                                {backup.backupTrigger}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scan History */}
          <TabsContent value="scans">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Scan History</CardTitle>
                <CardDescription>Previous conversation scans</CardDescription>
              </CardHeader>
              <CardContent>
                {!scanHistory || scanHistory.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-16 h-16 mx-auto mb-4" />
                    <p>No scans yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scanHistory.map((scan) => (
                      <Card key={scan.id} className="bg-slate-800/50 border-slate-600">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {scan.scanStatus === "completed" ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : scan.scanStatus === "failed" ? (
                                  <XCircle className="w-5 h-5 text-red-500" />
                                ) : (
                                  <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                                )}
                                <h3 className="font-semibold text-white capitalize">
                                  {scan.scanType.replace(/_/g, " ")}
                                </h3>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                                <p>Scanned: {scan.conversationsScanned}</p>
                                <p>Backups: {scan.backupsCreated}</p>
                                <p>Changes: {scan.authorshipChangesFound}</p>
                                <p>Duration: {scan.scanDurationMs}ms</p>
                              </div>
                              <p className="text-xs text-slate-500 mt-2">
                                {new Date(scan.startedAt).toLocaleString()}
                              </p>
                            </div>
                            <Badge
                              variant={
                                scan.scanStatus === "completed"
                                  ? "default"
                                  : scan.scanStatus === "failed"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {scan.scanStatus}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
