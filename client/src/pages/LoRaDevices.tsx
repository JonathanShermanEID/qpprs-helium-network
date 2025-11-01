/**
 * LoRa Devices Management Page
 * GPS Tracking and Google Maps Integration
 * Author: Jonathan Sherman
 * Monaco Edition 🏎️
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, MapPin, Radio, Battery, Signal, Power, PowerOff } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function LoRaDevices() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: devices, refetch } = trpc.lora.getDevices.useQuery(
    undefined,
    { enabled: isAuthenticated, refetchInterval: 5000 }
  );

  const { data: status } = trpc.lora.getStatus.useQuery(
    undefined,
    { enabled: isAuthenticated, refetchInterval: 3000 }
  );

  const powerOnMutation = trpc.lora.powerOn.useMutation({
    onSuccess: () => {
      toast.success("LoRa powered on");
      refetch();
    },
  });

  const powerOffMutation = trpc.lora.powerOff.useMutation({
    onSuccess: () => {
      toast.success("LoRa powered off");
      refetch();
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-card max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access LoRa Devices</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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
          <div className="flex items-center justify-between">
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
                  LoRa Devices
                </h1>
                <p className="text-sm text-muted-foreground">GPS Tracking & Device Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {status?.powerState.enabled ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => powerOffMutation.mutate()}
                  disabled={powerOffMutation.isPending}
                  className="border-red-500/50 hover:bg-red-500/10"
                >
                  <PowerOff className="w-4 h-4 mr-2" />
                  Power Off
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => powerOnMutation.mutate()}
                  disabled={powerOnMutation.isPending}
                  className="border-green-500/50 hover:bg-green-500/10"
                >
                  <Power className="w-4 h-4 mr-2" />
                  Power On
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Google Maps Placeholder */}
        <Card className="glass-card border-accent/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              Device Locations
            </CardTitle>
            <CardDescription>
              Interactive map showing all LoRa devices with GPS coordinates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-96 bg-gradient-to-br from-accent/5 to-primary/5 rounded-lg border border-border/30 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold text-foreground mb-2">Google Maps Integration</p>
                <p className="text-sm text-muted-foreground max-w-md">
                  Interactive map will display here showing all {devices?.length || 0} LoRa devices with real-time GPS coordinates
                </p>
                {devices && devices.length > 0 && devices[0].gps && (
                  <div className="mt-4 text-xs text-muted-foreground">
                    <p>Primary Device Location:</p>
                    <p className="font-mono">
                      {devices[0].gps.latitude.toFixed(6)}, {devices[0].gps.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device List */}
        <div className="grid grid-cols-1 gap-6">
          {devices && devices.length > 0 ? (
            devices.map((device) => (
              <Card key={device.id} className="glass-card border-primary/30 hover:border-accent/50 transition-all">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Device Info */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                          <Radio className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{device.name}</h3>
                          <p className="text-xs text-muted-foreground font-mono">{device.devEUI}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">App EUI:</span>
                          <span className="font-mono text-xs">{device.appEUI}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Frequency:</span>
                          <span className="font-semibold">{device.frequency} MHz</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Power:</span>
                          <span className="font-semibold">{device.power} dBm</span>
                        </div>
                      </div>
                    </div>

                    {/* GPS Coordinates */}
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        GPS Coordinates
                      </h4>
                      {device.gps ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Latitude:</span>
                            <span className="font-mono">{device.gps.latitude.toFixed(6)}°</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Longitude:</span>
                            <span className="font-mono">{device.gps.longitude.toFixed(6)}°</span>
                          </div>
                          {device.gps.altitude && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Altitude:</span>
                              <span className="font-mono">{device.gps.altitude.toFixed(1)} m</span>
                            </div>
                          )}
                          {device.gps.accuracy && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Accuracy:</span>
                              <span className="font-mono">±{device.gps.accuracy.toFixed(1)} m</span>
                            </div>
                          )}
                          {device.location && (
                            <div className="mt-3 pt-3 border-t border-border/30">
                              <p className="text-xs text-muted-foreground">Location</p>
                              <p className="font-semibold">{device.location}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No GPS data available</p>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <Signal className="w-4 h-4" />
                        Device Status
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${device.enabled ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                          <span className="text-sm font-semibold">
                            {device.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        {device.batteryLevel !== undefined && (
                          <div className="flex items-center gap-2">
                            <Battery className="w-4 h-4 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">Battery</span>
                                <span className="text-xs font-semibold">{device.batteryLevel}%</span>
                              </div>
                              <div className="w-full h-2 bg-border/30 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    device.batteryLevel > 60 ? 'bg-green-500' :
                                    device.batteryLevel > 30 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${device.batteryLevel}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Last seen: {new Date(device.lastSeen).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No LoRa devices detected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Power on the LoRa gateway to start detecting devices
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
