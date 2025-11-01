/**
 * 3D Network Visualization Component
 * Interactive 3D visualization of Helium mesh network topology
 * Author: Jonathan Sherman
 * Monaco Edition 🏎️
 */

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, RotateCcw, Zap } from 'lucide-react';

interface NetworkNode {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  status: 'online' | 'offline';
  connections: number;
}

interface NetworkConnection {
  from: string;
  to: string;
  strength: number;
}

export function Network3DVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [connections, setConnections] = useState<NetworkConnection[]>([]);
  const animationRef = useRef<number>(0);

  // Generate network topology
  useEffect(() => {
    const generateNetwork = () => {
      const nodeCount = 20;
      const generatedNodes: NetworkNode[] = [];
      const generatedConnections: NetworkConnection[] = [];

      // Create nodes in 3D space
      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2;
        const radius = 150 + Math.random() * 100;
        const height = (Math.random() - 0.5) * 200;

        generatedNodes.push({
          id: `node-${i}`,
          name: `Hotspot ${i + 1}`,
          x: Math.cos(angle) * radius,
          y: height,
          z: Math.sin(angle) * radius,
          status: Math.random() > 0.05 ? 'online' : 'offline',
          connections: Math.floor(Math.random() * 5) + 1,
        });
      }

      // Create connections between nearby nodes
      for (let i = 0; i < generatedNodes.length; i++) {
        const connectionsCount = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < connectionsCount; j++) {
          const targetIndex = (i + j + 1) % generatedNodes.length;
          generatedConnections.push({
            from: generatedNodes[i].id,
            to: generatedNodes[targetIndex].id,
            strength: Math.random(),
          });
        }
      }

      setNodes(generatedNodes);
      setConnections(generatedConnections);
    };

    generateNetwork();
  }, []);

  // 3D rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const project3D = (x: number, y: number, z: number) => {
      // Apply rotation
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);

      // Rotate around Y axis
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // Rotate around X axis
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      // Perspective projection
      const perspective = 500;
      const scale = perspective / (perspective + z2);

      return {
        x: centerX + x1 * scale,
        y: centerY + y1 * scale,
        scale: scale,
        z: z2,
      };
    };

    const render = () => {
      // Clear canvas
      ctx.fillStyle = '#0a0f1e';
      ctx.fillRect(0, 0, width, height);

      // Draw connections
      connections.forEach((conn) => {
        const fromNode = nodes.find((n) => n.id === conn.from);
        const toNode = nodes.find((n) => n.id === conn.to);

        if (fromNode && toNode) {
          const from = project3D(fromNode.x, fromNode.y, fromNode.z);
          const to = project3D(toNode.x, toNode.y, toNode.z);

          // Only draw if both nodes are in front
          if (from.z > -200 && to.z > -200) {
            const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
            const alpha = Math.max(0.1, conn.strength * 0.5);
            gradient.addColorStop(0, `rgba(6, 182, 212, ${alpha})`);
            gradient.addColorStop(1, `rgba(34, 211, 238, ${alpha})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1 + conn.strength;
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
          }
        }
      });

      // Draw nodes
      const sortedNodes = [...nodes].sort((a, b) => {
        const aProj = project3D(a.x, a.y, a.z);
        const bProj = project3D(b.x, b.y, b.z);
        return aProj.z - bProj.z;
      });

      sortedNodes.forEach((node) => {
        const proj = project3D(node.x, node.y, node.z);

        if (proj.z > -200) {
          const radius = 4 * proj.scale;

          // Node glow
          const gradient = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, radius * 3);
          if (node.status === 'online') {
            gradient.addColorStop(0, 'rgba(34, 211, 238, 0.8)');
            gradient.addColorStop(0.5, 'rgba(34, 211, 238, 0.3)');
            gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
          } else {
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
            gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.3)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
          }

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, radius * 3, 0, Math.PI * 2);
          ctx.fill();

          // Node core
          ctx.fillStyle = node.status === 'online' ? '#22d3ee' : '#ef4444';
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Node ring
          ctx.strokeStyle = node.status === 'online' ? '#06b6d4' : '#dc2626';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, radius * 1.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Auto-rotate
      setRotation((prev) => ({
        x: prev.x + 0.002,
        y: prev.y + 0.003,
      }));

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes, connections, rotation]);

  const resetRotation = () => {
    setRotation({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Card className={`bg-slate-900/50 border-cyan-500/20 overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-cyan-300">3D Network Topology</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetRotation}
            className="border-cyan-500/30 hover:bg-cyan-500/10"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="border-cyan-500/30 hover:bg-cyan-500/10"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={isFullscreen ? 1200 : 800}
          height={isFullscreen ? 800 : 500}
          className="w-full h-auto"
        />

        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3 text-xs text-cyan-300">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <span>{nodes.filter((n) => n.status === 'online').length} Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span>{nodes.filter((n) => n.status === 'offline').length} Offline</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>{connections.length} Connections</span>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-2 text-xs text-cyan-300">
          <div className="text-center font-mono">Monaco Edition 🏎️</div>
          <div className="text-center text-[10px] text-cyan-400/60">by Jonathan Sherman</div>
        </div>
      </div>
    </Card>
  );
}
