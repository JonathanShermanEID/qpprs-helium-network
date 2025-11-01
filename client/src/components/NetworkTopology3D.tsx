/**
 * 3D Network Topology Visualization Component
 * Interactive 3D visualization of Helium Network
 * Author: Jonathan Sherman
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface NetworkTopology3DProps {
  hotspotCount?: number;
  networkDensity?: 'low' | 'medium' | 'high';
}

export default function NetworkTopology3D({ 
  hotspotCount = 100, 
  networkDensity = 'medium' 
}: NetworkTopology3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [model3DUrl, setModel3DUrl] = useState<string | null>(null);
  
  const generate3DModel = trpc.visualization.generate3DTopology.useMutation();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Generate network nodes
    const nodes: Array<{ x: number; y: number; z: number; connections: number[] }> = [];
    for (let i = 0; i < hotspotCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 200 - 100, // Depth
        connections: [],
      });
    }

    // Generate connections based on density
    const connectionCount = networkDensity === 'low' ? 2 : networkDensity === 'medium' ? 4 : 6;
    nodes.forEach((node, i) => {
      for (let j = 0; j < connectionCount; j++) {
        const targetIndex = Math.floor(Math.random() * nodes.length);
        if (targetIndex !== i && !node.connections.includes(targetIndex)) {
          node.connections.push(targetIndex);
        }
      }
    });

    // Animation loop
    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.01;
      
      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply rotation
      const rotX = rotation.x + time * 0.2;
      const rotY = rotation.y + time * 0.3;

      // Draw connections
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)'; // Blue
      ctx.lineWidth = 1;
      
      nodes.forEach((node, i) => {
        node.connections.forEach(targetIndex => {
          const target = nodes[targetIndex];
          
          // Apply 3D rotation
          const x1 = node.x + Math.cos(rotY) * node.z * 0.5;
          const y1 = node.y + Math.sin(rotX) * node.z * 0.5;
          const x2 = target.x + Math.cos(rotY) * target.z * 0.5;
          const y2 = target.y + Math.sin(rotX) * target.z * 0.5;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        });
      });

      // Draw nodes
      nodes.forEach(node => {
        const x = node.x + Math.cos(rotY) * node.z * 0.5;
        const y = node.y + Math.sin(rotX) * node.z * 0.5;
        const scale = 1 + node.z / 200;
        const size = 3 * scale;

        // Glow effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Node core
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [hotspotCount, networkDensity, rotation]);

  const handleGenerate3D = async () => {
    setIsGenerating(true);
    try {
      const result = await generate3DModel.mutateAsync({
        hotspotCount,
        networkDensity,
      });
      setModel3DUrl(result.modelUrl);
    } catch (error) {
      console.error('Failed to generate 3D model:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const resetRotation = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <Card className={`glass-card border-primary/30 ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              3D Network Topology
              <span className="text-xs text-muted-foreground font-normal">by Jonathan Sherman</span>
            </CardTitle>
            <CardDescription>
              Interactive visualization of {hotspotCount} hotspots ({networkDensity} density)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={resetRotation}
              className="hover:bg-primary/10"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="hover:bg-primary/10"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full rounded-lg border border-primary/20 bg-black/20"
            style={{ height: isFullscreen ? 'calc(100vh - 200px)' : '400px' }}
            onMouseMove={(e) => {
              if (e.buttons === 1) {
                setRotation(prev => ({
                  x: prev.x + e.movementY * 0.01,
                  y: prev.y + e.movementX * 0.01,
                }));
              }
            }}
          />
          
          {/* Controls overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
            <div className="text-xs text-muted-foreground bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg">
              Drag to rotate • {hotspotCount} nodes • Created by Jonathan Sherman
            </div>
            
            <Button
              onClick={handleGenerate3D}
              disabled={isGenerating}
              className="bg-primary/20 hover:bg-primary/30 backdrop-blur-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating 3D Model...
                </>
              ) : (
                'Generate High-Quality 3D'
              )}
            </Button>
          </div>

          {/* 3D Model viewer */}
          {model3DUrl && (
            <div className="mt-4 p-4 glass-card border-accent/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                High-quality 3D model generated by Jonathan Sherman
              </p>
              <a
                href={model3DUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                Download GLB Model →
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
