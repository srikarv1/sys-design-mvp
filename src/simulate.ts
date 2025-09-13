import { PlacedComponent, Connection, ComponentType, components, TrafficProfile } from './componentsSchema';
import { Challenge } from './sampleChallenges';
import { ChaosEvent } from './ChaosEvents';

export interface SimulationResult {
  metrics: {
    latency: {
      p50: number;
      p95: number;
      p99: number;
    };
    throughput: number;
    availability: number;
    cost: number;
  };
  score: number;
  feedback: string[];
  violations: string[];
  recommendations: string[];
}

export interface SystemDesign {
  components: PlacedComponent[];
  connections: Connection[];
  activeChaosEvents?: ChaosEvent[];
}

export const simulate = (challenge: Challenge, design: SystemDesign): SimulationResult => {
  const { components: placedComponents, connections, activeChaosEvents = [] } = design;
  const traffic = challenge.trafficProfile;
  
  // Calculate metrics
  const metrics = calculateMetrics(placedComponents, connections, traffic, challenge, activeChaosEvents);
  
  // Calculate score based on rubric
  const { score, feedback, violations, recommendations } = calculateScore(
    challenge, 
    placedComponents, 
    connections, 
    metrics,
    activeChaosEvents
  );

  return {
    metrics,
    score,
    feedback,
    violations,
    recommendations
  };
};

function calculateMetrics(
  placedComponents: PlacedComponent[], 
  connections: Connection[], 
  traffic: TrafficProfile,
  challenge: Challenge,
  activeChaosEvents: ChaosEvent[]
) {
  // Calculate base metrics
  let latency = calculateLatency(placedComponents, connections, traffic);
  let availability = calculateAvailability(placedComponents, connections);
  let cost = calculateCost(placedComponents, traffic);
  let throughput = calculateThroughput(placedComponents, connections, traffic);

  // Apply chaos event effects
  activeChaosEvents.forEach(event => {
    if (event.effects.latencyMultiplier) {
      latency *= event.effects.latencyMultiplier;
    }
    if (event.effects.availabilityReduction) {
      availability *= (1 - event.effects.availabilityReduction);
    }
    if (event.effects.costMultiplier) {
      cost *= event.effects.costMultiplier;
    }
  });

  return {
    latency: {
      p50: latency * 0.8,
      p95: latency * 1.5,
      p99: latency * 2.0
    },
    throughput,
    availability,
    cost
  };
}

function calculateLatency(
  placedComponents: PlacedComponent[], 
  connections: Connection[], 
  traffic: TrafficProfile
): number {
  if (placedComponents.length === 0) return 1000; // High penalty for empty design

  // Find the main path through the system
  const mainPath = findMainPath(placedComponents, connections);
  if (mainPath.length === 0) return 1000;

  let totalLatency = 0;
  
  for (const componentId of mainPath) {
    const component = placedComponents.find(c => c.id === componentId);
    if (!component) continue;
    
    const componentType = components.find(ct => ct.id === component.typeId);
    if (!componentType) continue;
    
    totalLatency += componentType.latencyFn(component.params, traffic);
  }

  // Add network latency between components
  totalLatency += (mainPath.length - 1) * 5; // 5ms per hop

  return totalLatency;
}

function calculateAvailability(
  placedComponents: PlacedComponent[], 
  connections: Connection[]
): number {
  if (placedComponents.length === 0) return 0;

  // Calculate availability for each component
  const componentAvailabilities = placedComponents.map(component => {
    const componentType = components.find(ct => ct.id === component.typeId);
    if (!componentType) return 0.5; // Default low availability for unknown components
    
    return componentType.availabilityFn(component.params);
  });

  // For simplicity, assume components are in series (worst case)
  // In a real system, you'd analyze the topology more carefully
  return componentAvailabilities.reduce((acc, avail) => acc * avail, 1);
}

function calculateCost(placedComponents: PlacedComponent[], traffic: TrafficProfile): number {
  return placedComponents.reduce((total, component) => {
    const componentType = components.find(ct => ct.id === component.typeId);
    if (!componentType) return total;
    
    return total + componentType.costFn(component.params, traffic);
  }, 0);
}

function calculateThroughput(
  placedComponents: PlacedComponent[], 
  connections: Connection[], 
  traffic: TrafficProfile
): number {
  // Simplified throughput calculation
  const bottleneckComponent = placedComponents.reduce((min, component) => {
    const componentType = components.find(ct => ct.id === component.typeId);
    if (!componentType) return min;
    
    const capacity = (component.params.replicas || 1) * 1000; // Assume 1000 RPS per replica
    return Math.min(min, capacity);
  }, Infinity);

  return Math.min(traffic.rps, bottleneckComponent);
}

function findMainPath(placedComponents: PlacedComponent[], connections: Connection[]): string[] {
  // Simple heuristic: find the longest path from input to output
  const inputComponents = placedComponents.filter(c => 
    components.find(ct => ct.id === c.typeId)?.category === 'edge'
  );
  
  if (inputComponents.length === 0) return [];
  
  // Start from first input component and follow connections
  const path = [inputComponents[0].id];
  const visited = new Set([inputComponents[0].id]);
  
  let current = inputComponents[0].id;
  while (true) {
    const outgoing = connections.filter(c => c.fromId === current && !visited.has(c.toId));
    if (outgoing.length === 0) break;
    
    const next = outgoing[0].toId;
    path.push(next);
    visited.add(next);
    current = next;
  }
  
  return path;
}

function calculateScore(
  challenge: Challenge,
  placedComponents: PlacedComponent[],
  connections: Connection[],
  metrics: any,
  activeChaosEvents: ChaosEvent[]
): { score: number; feedback: string[]; violations: string[]; recommendations: string[] } {
  let score = 0;
  const feedback: string[] = [];
  const violations: string[] = [];
  const recommendations: string[] = [];

  // Check must-haves
  const componentTypes = placedComponents.map(c => 
    components.find(ct => ct.id === c.typeId)?.name || ''
  );
  
  challenge.mustHaves.forEach(mustHave => {
    if (componentTypes.some(type => type.includes(mustHave))) {
      score += 10;
      feedback.push(`✓ Included required component: ${mustHave}`);
    } else {
      score -= 5;
      violations.push(`Missing required component: ${mustHave}`);
    }
  });

  // Check anti-patterns
  challenge.antiPatterns.forEach(antiPattern => {
    if (componentTypes.some(type => type.includes(antiPattern))) {
      score -= 10;
      violations.push(`Anti-pattern detected: ${antiPattern}`);
    }
  });

  // Check SLA compliance
  if (metrics.latency.p95 <= challenge.sla.maxLatency) {
    score += 20;
    feedback.push(`✓ Latency SLA met: ${metrics.latency.p95.toFixed(1)}ms ≤ ${challenge.sla.maxLatency}ms`);
  } else {
    score -= 15;
    violations.push(`Latency SLA violated: ${metrics.latency.p95.toFixed(1)}ms > ${challenge.sla.maxLatency}ms`);
  }

  if (metrics.availability >= challenge.sla.minAvailability) {
    score += 20;
    feedback.push(`✓ Availability SLA met: ${(metrics.availability * 100).toFixed(2)}% ≥ ${(challenge.sla.minAvailability * 100).toFixed(2)}%`);
  } else {
    score -= 15;
    violations.push(`Availability SLA violated: ${(metrics.availability * 100).toFixed(2)}% < ${(challenge.sla.minAvailability * 100).toFixed(2)}%`);
  }

  // Check budget
  if (metrics.cost <= challenge.budget) {
    score += 15;
    feedback.push(`✓ Budget met: $${metrics.cost.toFixed(0)} ≤ $${challenge.budget}`);
  } else {
    score -= 10;
    violations.push(`Budget exceeded: $${metrics.cost.toFixed(0)} > $${challenge.budget}`);
  }

  // Chaos event feedback
  if (activeChaosEvents.length > 0) {
    feedback.push(`🧪 Testing with ${activeChaosEvents.length} chaos event(s)`);
    activeChaosEvents.forEach(event => {
      feedback.push(`💥 ${event.name}: ${event.description}`);
    });
  }

  // Generate recommendations
  if (metrics.latency.p95 > challenge.sla.maxLatency) {
    recommendations.push('Consider adding more replicas or caching layers to reduce latency');
  }
  if (metrics.availability < challenge.sla.minAvailability) {
    recommendations.push('Add redundancy and failover mechanisms to improve availability');
  }
  if (metrics.cost > challenge.budget) {
    recommendations.push('Optimize component sizing or consider more cost-effective alternatives');
  }

  // Chaos-specific recommendations
  if (activeChaosEvents.length > 0) {
    recommendations.push('💡 Consider adding circuit breakers and bulkheads for better resilience');
    recommendations.push('🔄 Implement graceful degradation strategies for failure scenarios');
  }

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));

  return { score, feedback, violations, recommendations };
}
