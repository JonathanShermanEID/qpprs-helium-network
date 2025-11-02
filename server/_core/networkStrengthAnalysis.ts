/**
 * Intelligent Network Strength Analysis System
 * Author: Jonathan Sherman - Monaco Edition
 * 
 * Analyzes surrounding networks and only connects if they strengthen current network
 */

/**
 * Network metrics for strength evaluation
 */
interface NetworkMetrics {
  networkId: string;
  networkName: string;
  
  // Coverage metrics
  coverageArea: number; // square kilometers
  hotspotCount: number;
  activeHotspots: number;
  
  // Performance metrics
  averageLatency: number; // milliseconds
  averageBandwidth: number; // Mbps
  uptime: number; // percentage (0-100)
  packetLoss: number; // percentage (0-100)
  
  // Network health
  errorRate: number; // percentage (0-100)
  congestionLevel: number; // percentage (0-100)
  
  // Geographic data
  latitude: number;
  longitude: number;
  radius: number; // kilometers
}

/**
 * Current network state
 */
interface CurrentNetworkState {
  totalCoverage: number;
  totalHotspots: number;
  averageLatency: number;
  averageBandwidth: number;
  overallUptime: number;
  networkScore: number;
}

/**
 * Network evaluation result
 */
interface NetworkEvaluationResult {
  shouldConnect: boolean;
  strengthIncrease: number; // percentage improvement
  reason: string;
  metrics: {
    coverageImprovement: number;
    latencyImprovement: number;
    bandwidthImprovement: number;
    uptimeImprovement: number;
    scoreImprovement: number;
  };
}

/**
 * Calculate network strength score (0-100)
 */
export function calculateNetworkScore(metrics: NetworkMetrics): number {
  // Weighted scoring algorithm
  const weights = {
    coverage: 0.20,
    hotspots: 0.15,
    latency: 0.20,
    bandwidth: 0.20,
    uptime: 0.15,
    reliability: 0.10,
  };

  // Normalize metrics to 0-100 scale
  const coverageScore = Math.min((metrics.coverageArea / 1000) * 100, 100); // 1000 km² = 100
  const hotspotScore = Math.min((metrics.activeHotspots / 100) * 100, 100); // 100 hotspots = 100
  const latencyScore = Math.max(100 - (metrics.averageLatency / 10), 0); // <10ms = 100, >1000ms = 0
  const bandwidthScore = Math.min((metrics.averageBandwidth / 100) * 100, 100); // 100 Mbps = 100
  const uptimeScore = metrics.uptime;
  const reliabilityScore = Math.max(100 - metrics.errorRate - metrics.packetLoss, 0);

  const totalScore =
    coverageScore * weights.coverage +
    hotspotScore * weights.hotspots +
    latencyScore * weights.latency +
    bandwidthScore * weights.bandwidth +
    uptimeScore * weights.uptime +
    reliabilityScore * weights.reliability;

  return Math.round(totalScore * 100) / 100;
}

/**
 * Calculate current network state
 */
export function calculateCurrentNetworkState(networks: NetworkMetrics[]): CurrentNetworkState {
  if (networks.length === 0) {
    return {
      totalCoverage: 0,
      totalHotspots: 0,
      averageLatency: 0,
      averageBandwidth: 0,
      overallUptime: 0,
      networkScore: 0,
    };
  }

  const totalCoverage = networks.reduce((sum, n) => sum + n.coverageArea, 0);
  const totalHotspots = networks.reduce((sum, n) => sum + n.activeHotspots, 0);
  const averageLatency = networks.reduce((sum, n) => sum + n.averageLatency, 0) / networks.length;
  const averageBandwidth = networks.reduce((sum, n) => sum + n.averageBandwidth, 0) / networks.length;
  const overallUptime = networks.reduce((sum, n) => sum + n.uptime, 0) / networks.length;

  // Calculate combined network score
  const combinedMetrics: NetworkMetrics = {
    networkId: "combined",
    networkName: "Current Network",
    coverageArea: totalCoverage,
    hotspotCount: totalHotspots,
    activeHotspots: totalHotspots,
    averageLatency,
    averageBandwidth,
    uptime: overallUptime,
    packetLoss: networks.reduce((sum, n) => sum + n.packetLoss, 0) / networks.length,
    errorRate: networks.reduce((sum, n) => sum + n.errorRate, 0) / networks.length,
    congestionLevel: networks.reduce((sum, n) => sum + n.congestionLevel, 0) / networks.length,
    latitude: 0,
    longitude: 0,
    radius: 0,
  };

  const networkScore = calculateNetworkScore(combinedMetrics);

  return {
    totalCoverage,
    totalHotspots,
    averageLatency,
    averageBandwidth,
    overallUptime,
    networkScore,
  };
}

/**
 * Evaluate if surrounding network strengthens current network
 */
export function evaluateSurroundingNetwork(
  currentState: CurrentNetworkState,
  surroundingNetwork: NetworkMetrics
): NetworkEvaluationResult {
  // Calculate metrics with surrounding network added
  const surroundingScore = calculateNetworkScore(surroundingNetwork);

  // Simulate adding the surrounding network
  const projectedCoverage = currentState.totalCoverage + surroundingNetwork.coverageArea;
  const projectedHotspots = currentState.totalHotspots + surroundingNetwork.activeHotspots;
  
  // Weighted average for latency and bandwidth
  const totalHotspots = currentState.totalHotspots + surroundingNetwork.activeHotspots;
  const projectedLatency =
    (currentState.averageLatency * currentState.totalHotspots +
      surroundingNetwork.averageLatency * surroundingNetwork.activeHotspots) /
    totalHotspots;
  const projectedBandwidth =
    (currentState.averageBandwidth * currentState.totalHotspots +
      surroundingNetwork.averageBandwidth * surroundingNetwork.activeHotspots) /
    totalHotspots;
  const projectedUptime =
    (currentState.overallUptime * currentState.totalHotspots +
      surroundingNetwork.uptime * surroundingNetwork.activeHotspots) /
    totalHotspots;

  // Calculate improvements
  const coverageImprovement = ((projectedCoverage - currentState.totalCoverage) / currentState.totalCoverage) * 100;
  const latencyImprovement = ((currentState.averageLatency - projectedLatency) / currentState.averageLatency) * 100;
  const bandwidthImprovement = ((projectedBandwidth - currentState.averageBandwidth) / currentState.averageBandwidth) * 100;
  const uptimeImprovement = ((projectedUptime - currentState.overallUptime) / currentState.overallUptime) * 100;

  // Calculate projected network score
  const projectedMetrics: NetworkMetrics = {
    networkId: "projected",
    networkName: "Projected Network",
    coverageArea: projectedCoverage,
    hotspotCount: projectedHotspots,
    activeHotspots: projectedHotspots,
    averageLatency: projectedLatency,
    averageBandwidth: projectedBandwidth,
    uptime: projectedUptime,
    packetLoss: (currentState.totalHotspots * 0 + surroundingNetwork.packetLoss * surroundingNetwork.activeHotspots) / totalHotspots,
    errorRate: (currentState.totalHotspots * 0 + surroundingNetwork.errorRate * surroundingNetwork.activeHotspots) / totalHotspots,
    congestionLevel: 0,
    latitude: 0,
    longitude: 0,
    radius: 0,
  };

  const projectedScore = calculateNetworkScore(projectedMetrics);
  const scoreImprovement = ((projectedScore - currentState.networkScore) / currentState.networkScore) * 100;

  // Decision criteria: Connect only if network strengthens
  const shouldConnect =
    scoreImprovement > 0 && // Overall score must improve
    surroundingScore >= 60 && // Surrounding network must be high quality (>60/100)
    surroundingNetwork.uptime >= 95 && // Must have excellent uptime
    surroundingNetwork.errorRate < 5 && // Low error rate
    surroundingNetwork.packetLoss < 2; // Low packet loss

  let reason = "";
  if (!shouldConnect) {
    if (scoreImprovement <= 0) {
      reason = `Network would decrease overall score by ${Math.abs(scoreImprovement).toFixed(2)}%`;
    } else if (surroundingScore < 60) {
      reason = `Surrounding network quality too low (${surroundingScore.toFixed(2)}/100)`;
    } else if (surroundingNetwork.uptime < 95) {
      reason = `Uptime too low (${surroundingNetwork.uptime.toFixed(2)}%)`;
    } else if (surroundingNetwork.errorRate >= 5) {
      reason = `Error rate too high (${surroundingNetwork.errorRate.toFixed(2)}%)`;
    } else if (surroundingNetwork.packetLoss >= 2) {
      reason = `Packet loss too high (${surroundingNetwork.packetLoss.toFixed(2)}%)`;
    }
  } else {
    reason = `Network strengthens overall score by ${scoreImprovement.toFixed(2)}%`;
  }

  return {
    shouldConnect,
    strengthIncrease: scoreImprovement,
    reason,
    metrics: {
      coverageImprovement,
      latencyImprovement,
      bandwidthImprovement,
      uptimeImprovement,
      scoreImprovement,
    },
  };
}

/**
 * Discover surrounding networks within radius
 */
export async function discoverSurroundingNetworks(
  centerLat: number,
  centerLon: number,
  radiusKm: number
): Promise<NetworkMetrics[]> {
  // In production, this would query external APIs or databases
  // For now, return mock data
  console.log(`[Network Discovery] Scanning ${radiusKm}km radius around ${centerLat}, ${centerLon}`);

  // Mock surrounding networks
  return [
    {
      networkId: "ext-network-1",
      networkName: "Urban Mesh Network",
      coverageArea: 250,
      hotspotCount: 45,
      activeHotspots: 42,
      averageLatency: 15,
      averageBandwidth: 85,
      uptime: 98.5,
      packetLoss: 0.5,
      errorRate: 1.2,
      congestionLevel: 15,
      latitude: centerLat + 0.1,
      longitude: centerLon + 0.1,
      radius: 10,
    },
    {
      networkId: "ext-network-2",
      networkName: "Suburban Coverage",
      coverageArea: 180,
      hotspotCount: 28,
      activeHotspots: 25,
      averageLatency: 22,
      averageBandwidth: 65,
      uptime: 96.2,
      packetLoss: 1.2,
      errorRate: 2.5,
      congestionLevel: 25,
      latitude: centerLat - 0.15,
      longitude: centerLon + 0.05,
      radius: 8,
    },
    {
      networkId: "ext-network-3",
      networkName: "Weak Legacy Network",
      coverageArea: 90,
      hotspotCount: 12,
      activeHotspots: 8,
      averageLatency: 85,
      averageBandwidth: 25,
      uptime: 88.5,
      packetLoss: 4.5,
      errorRate: 8.2,
      congestionLevel: 60,
      latitude: centerLat + 0.2,
      longitude: centerLon - 0.1,
      radius: 5,
    },
  ];
}

console.log("[Network Strength Analysis] System initialized");
console.log("[Network Strength Analysis] Only connecting to networks that strengthen current network");
