/**
 * Device Management Dashboard
 * Author: Jonathan Sherman - Monaco Edition
 * 
 * Comprehensive device lifecycle management:
 * - Device activation and registration
 * - Configuration management
 * - Firmware updates (OTA)
 * - Provisioning logs
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Smartphone, Cpu, Radio, Network, CheckCircle2, XCircle, Clock, Download, Upload, Settings, Activity } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DeviceManagement() {
  const { user, loading, isAuthenticated } = useAuth();
  const [activationCode, setActivationCode] = useState("");
  const [deviceType, setDeviceType] = useState<"hotspot" | "gateway" | "repeater" | "phone">("hotspot");
  const [expiresInDays, setExpiresInDays] = useState(30);

  const { data: devices, refetch: refetchDevices } = trpc.deviceActivation.listActivatedDevices.useQuery();

  const generateCode = trpc.deviceActivation.generateActivationCode.useMutation({
    onSuccess: (data) => {
      toast.success("Activation code generated!", {
        description: `Code: ${data.activationCode}`,
      });
      refetchDevices();
    },
    onError: (error) => {
      toast.error("Failed to generate code", {
        description: error.message,
      });
    },
  });

  const activateDevice = trpc.deviceActivation.activateDevice.useMutation({
    onSuccess: () => {
      toast.success("Device activated successfully!");
      setActivationCode("");
      refetchDevices();
    },
    onError: (error) => {
      toast.error("Activation failed", {
        description: error.message,
      });
    },
  });

  const handleGenerateCode = () => {
    generateCode.mutate({
      deviceType,
      expiresInDays,
    });
  };

  const handleActivateDevice = () => {
    if (!activationCode.trim()) {
      toast.error("Please enter an activation code");
      return;
    }
    activateDevice.mutate({
      activationCode: activationCode.trim(),
    });
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "hotspot": return Radio;
      case "gateway": return Network;
      case "repeater": return Cpu;
      case "phone": return Smartphone;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "activated": return "text-green-500";
      case "pending": return "text-yellow-500";
      case "deactivated": return "text-red-500";
      case "suspended": return "text-orange-500";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "activated": return CheckCircle2;
      case "pending": return Clock;
      default: return XCircle;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
          </div>
          <p className="text-muted-foreground animate-pulse">Loading device management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Futuristic background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl bg-card/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Device Management
              </h1>
              <p className="text-sm text-muted-foreground">Activate and program your network devices</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="glass-card px-4 py-2 rounded-full">
                <p className="text-sm font-medium">{user?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="activate" className="space-y-6">
          <TabsList className="glass-card">
            <TabsTrigger value="activate">Activate Device</TabsTrigger>
            <TabsTrigger value="devices">My Devices</TabsTrigger>
            <TabsTrigger value="firmware">Firmware</TabsTrigger>
          </TabsList>

          {/* Activate Device Tab */}
          <TabsContent value="activate" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Generate Activation Code */}
              <Card className="glass-card border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Generate Activation Code
                  </CardTitle>
                  <CardDescription>
                    Create a new activation code for your device
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deviceType">Device Type</Label>
                    <Select value={deviceType} onValueChange={(value: any) => setDeviceType(value)}>
                      <SelectTrigger id="deviceType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotspot">Helium Hotspot</SelectItem>
                        <SelectItem value="gateway">Network Gateway</SelectItem>
                        <SelectItem value="repeater">Signal Repeater</SelectItem>
                        <SelectItem value="phone">Phone Device</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiresIn">Expires In (Days)</Label>
                    <Input
                      id="expiresIn"
                      type="number"
                      value={expiresInDays}
                      onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 30)}
                      min={1}
                      max={365}
                    />
                  </div>

                  <Button
                    onClick={handleGenerateCode}
                    disabled={generateCode.isPending}
                    className="w-full"
                  >
                    {generateCode.isPending ? "Generating..." : "Generate Code"}
                  </Button>
                </CardContent>
              </Card>

              {/* Activate with Code */}
              <Card className="glass-card border-accent/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-accent" />
                    Activate Device
                  </CardTitle>
                  <CardDescription>
                    Enter your activation code to activate a device
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="activationCode">Activation Code</Label>
                    <Input
                      id="activationCode"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value)}
                      placeholder="HOTSPOT-1234567890-ABC123"
                      className="font-mono"
                    />
                  </div>

                  <Button
                    onClick={handleActivateDevice}
                    disabled={activateDevice.isPending || !activationCode.trim()}
                    className="w-full"
                    variant="default"
                  >
                    {activateDevice.isPending ? "Activating..." : "Activate Device"}
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    Enter the activation code provided during device setup
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Devices Tab */}
          <TabsContent value="devices" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {devices && devices.length > 0 ? (
                devices.map((device) => {
                  const Icon = getDeviceIcon(device.deviceType);
                  const StatusIcon = getStatusIcon(device.status);
                  
                  return (
                    <Card key={device.deviceId} className="glass-card border-border/30 hover:border-primary/50 transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-primary/10">
                              <Icon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{device.deviceId}</CardTitle>
                              <CardDescription className="capitalize">{device.deviceType}</CardDescription>
                            </div>
                          </div>
                          <div className={`flex items-center gap-2 ${getStatusColor(device.status)}`}>
                            <StatusIcon className="w-5 h-5" />
                            <span className="text-sm font-medium capitalize">{device.status}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Activation Code</p>
                            <p className="font-mono text-xs">{device.activationCode}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Created</p>
                            <p>{new Date(device.createdAt).toLocaleDateString()}</p>
                          </div>
                          {device.activatedAt && (
                            <div>
                              <p className="text-muted-foreground">Activated</p>
                              <p>{new Date(device.activatedAt).toLocaleDateString()}</p>
                            </div>
                          )}
                          {device.expiresAt && (
                            <div>
                              <p className="text-muted-foreground">Expires</p>
                              <p>{new Date(device.expiresAt).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="glass-card border-border/30">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Settings className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No devices activated yet</p>
                    <p className="text-sm text-muted-foreground">Generate an activation code to get started</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Firmware Tab */}
          <TabsContent value="firmware" className="space-y-6">
            <Card className="glass-card border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Firmware Management
                </CardTitle>
                <CardDescription>
                  Manage firmware versions and OTA updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Firmware management features coming soon. Over-the-air (OTA) updates will be available for all device types.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 backdrop-blur-xl bg-card/30 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{APP_TITLE}</span>
              <span className="mx-2">•</span>
              <span>Device Management System</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Author: Jonathan Sherman</span>
              <span className="mx-2">•</span>
              <span>Monaco Edition</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
