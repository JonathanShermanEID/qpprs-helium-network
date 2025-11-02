import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";

export default function VerizonNetworkManager() {
  const [isRemoving, setIsRemoving] = useState(false);
  const [removalResult, setRemovalResult] = useState<{
    success: boolean;
    removed: string[];
    failed: string[];
    message: string;
  } | null>(null);

  const { data: credentialsStatus, isLoading: statusLoading } = trpc.verizon.getCredentialsStatus.useQuery();
  const { data: restrictions, isLoading: restrictionsLoading, refetch: refetchRestrictions } = 
    trpc.verizon.detectRestrictions.useQuery({ deviceId: "iPhoneXR" });
  
  const removeRestrictionsMutation = trpc.verizon.removeRestrictions.useMutation({
    onSuccess: (data: any) => {
      setRemovalResult(data);
      setIsRemoving(false);
      refetchRestrictions();
    },
    onError: (error: any) => {
      console.error("Failed to remove restrictions:", error);
      setIsRemoving(false);
    }
  });

  const handleRemoveRestrictions = async () => {
    setIsRemoving(true);
    setRemovalResult(null);
    removeRestrictionsMutation.mutate({ deviceId: "iPhoneXR" });
  };

  const activeRestrictions = restrictions?.filter((r: any) => r.active) || [];
  const removableRestrictions = activeRestrictions.filter((r: any) => r.canRemove);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-blue-400" />
            Verizon Network Manager
          </h1>
          <p className="text-slate-400 text-lg">
            Manage network restrictions on your iPhone XR
          </p>
        </div>

        {/* Credentials Status */}
        <Card className="mb-6 bg-slate-900/50 border-slate-800 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              API Credentials Status
            </CardTitle>
            <CardDescription className="text-slate-400">
              Verizon API connection and authentication status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking credentials...
              </div>
            ) : credentialsStatus ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Configuration Status:</span>
                  {credentialsStatus.configured ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Configured
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      <XCircle className="w-3 h-3 mr-1" />
                      Not Configured
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">API Key:</span>
                    {credentialsStatus.hasApiKey ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Access Token:</span>
                    {credentialsStatus.hasAccessToken ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Client ID:</span>
                    {credentialsStatus.hasClientId ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Account Number:</span>
                    {credentialsStatus.hasAccountNumber ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                </div>
                
                <div className="pt-3 border-t border-slate-800">
                  <span className="text-sm text-slate-400">API Endpoint:</span>
                  <p className="text-slate-300 font-mono text-sm mt-1">{credentialsStatus.apiEndpoint}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">Unable to load credentials status</p>
            )}
          </CardContent>
        </Card>

        {/* Network Restrictions */}
        <Card className="mb-6 bg-slate-900/50 border-slate-800 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  Network Restrictions
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Detected restrictions on your iPhone XR
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchRestrictions()}
                disabled={restrictionsLoading}
                className="border-slate-700 hover:bg-slate-800"
              >
                <RefreshCw className={`w-4 h-4 ${restrictionsLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {restrictionsLoading ? (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning for restrictions...
              </div>
            ) : restrictions && restrictions.length > 0 ? (
              <div className="space-y-3">
                {restrictions.map((restriction: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{restriction.type}</h3>
                        <p className="text-sm text-slate-400 mt-1">{restriction.description}</p>
                      </div>
                      <div className="flex gap-2">
                        {restriction.active ? (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Inactive
                          </Badge>
                        )}
                        {restriction.canRemove && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            Removable
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {removableRestrictions.length > 0 && (
                  <div className="pt-4">
                    <Button
                      onClick={handleRemoveRestrictions}
                      disabled={isRemoving || !credentialsStatus?.configured}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isRemoving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Removing Restrictions...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Remove {removableRestrictions.length} Restriction(s)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-slate-300 font-medium">No restrictions detected</p>
                <p className="text-sm text-slate-400 mt-1">Your iPhone XR has full network access</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Removal Result */}
        {removalResult && (
          <Alert className={`${removalResult.success ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
            <AlertDescription className="text-white">
              <div className="flex items-start gap-3">
                {removalResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium mb-2">{removalResult.message}</p>
                  {removalResult.removed.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm text-green-400 font-medium">Removed:</p>
                      <ul className="text-sm text-slate-300 mt-1 ml-4 list-disc">
                        {removalResult.removed.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {removalResult.failed.length > 0 && (
                    <div>
                      <p className="text-sm text-yellow-400 font-medium">Failed:</p>
                      <ul className="text-sm text-slate-300 mt-1 ml-4 list-disc">
                        {removalResult.failed.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Info Card */}
        <Card className="bg-blue-500/10 border-blue-500/30 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">iPhone XR Exclusive</p>
                <p className="text-sm text-slate-300">
                  This system is exclusively for your iPhone XR. All restriction removal operations
                  are logged and protected by your device fingerprint authentication.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
