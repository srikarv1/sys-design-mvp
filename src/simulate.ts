import { PlacedComponent, Connection, ComponentType, components, TrafficProfile } from './componentsSchema';
import { Challenge } from './sampleChallenges';
import { ChaosEvent } from './ChaosEvents';
import { claudeFeedbackService, ClaudeFeedback } from './services/claudeFeedbackService';

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
  claudeFeedback?: ClaudeFeedback;
  isClaudeAnalysisAvailable: boolean;
}

export interface SystemDesign {
  components: PlacedComponent[];
  connections: Connection[];
  activeChaosEvents?: ChaosEvent[];
}

export const simulate = async (challenge: Challenge, design: SystemDesign): Promise<SimulationResult> => {
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

  // Get Claude feedback (async)
  let claudeFeedback: ClaudeFeedback | undefined;
  let isClaudeAnalysisAvailable = false;
  
  try {
    claudeFeedback = await claudeFeedbackService.getFeedback(
      challenge,
      placedComponents,
      connections,
      { metrics, score, feedback, violations, recommendations, isClaudeAnalysisAvailable: false }
    );
    isClaudeAnalysisAvailable = true;
  } catch (error) {
    console.warn('Claude feedback unavailable:', error);
    isClaudeAnalysisAvailable = false;
  }

  return {
    metrics,
    score, // Always use computed score; do not fallback to 0 or Claude's on failure
    feedback,
    violations,
    recommendations,
    claudeFeedback,
    isClaudeAnalysisAvailable
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

  // Base score for having components (proportional to component presence)
  if (placedComponents.length === 0) {
    score = 0;
    violations.push('No components placed - system cannot function');
    return { score, feedback, violations, recommendations };
  }

  // Component presence scoring (40% of total score)
  const componentPresenceScore = Math.min(40, placedComponents.length * 4);
  score += componentPresenceScore;
  feedback.push(`✓ Component presence: ${placedComponents.length} components (+${componentPresenceScore} points)`);

  // Connection quality scoring (20% of total score)
  const connectionScore = Math.min(20, connections.length * 2);
  score += connectionScore;
  if (connections.length > 0) {
    feedback.push(`✓ System connectivity: ${connections.length} connections (+${connectionScore} points)`);
  } else if (placedComponents.length > 1) {
    violations.push('Components are not connected - system cannot function');
    score -= 10;
  }

  // Check must-haves (15% of total score)
  const componentTypes = placedComponents.map(c => 
    components.find(ct => ct.id === c.typeId)?.name || ''
  );
  
  const mustHaveScore = Math.min(15, challenge.mustHaves.length * 5);
  let mustHavePoints = 0;
  challenge.mustHaves.forEach(mustHave => {
    if (componentTypes.some(type => type.includes(mustHave))) {
      mustHavePoints += 5;
      feedback.push(`✓ Included required component: ${mustHave}`);
    } else {
      violations.push(`Missing required component: ${mustHave}`);
    }
  });
  score += mustHavePoints;

  // Check anti-patterns (penalty)
  challenge.antiPatterns.forEach(antiPattern => {
    if (componentTypes.some(type => type.includes(antiPattern))) {
      score -= 10;
      violations.push(`Anti-pattern detected: ${antiPattern}`);
    }
  });

  // SLA compliance (15% of total score)
  if (metrics.latency.p95 <= challenge.sla.maxLatency) {
    score += 8;
    feedback.push(`✓ Latency SLA met: ${metrics.latency.p95.toFixed(1)}ms ≤ ${challenge.sla.maxLatency}ms`);
  } else {
    score -= 5;
    violations.push(`Latency SLA violated: ${metrics.latency.p95.toFixed(1)}ms > ${challenge.sla.maxLatency}ms`);
  }

  if (metrics.availability >= challenge.sla.minAvailability) {
    score += 7;
    feedback.push(`✓ Availability SLA met: ${(metrics.availability * 100).toFixed(2)}% ≥ ${(challenge.sla.minAvailability * 100).toFixed(2)}%`);
  } else {
    score -= 5;
    violations.push(`Availability SLA violated: ${(metrics.availability * 100).toFixed(2)}% < ${(challenge.sla.minAvailability * 100).toFixed(2)}%`);
  }

  // Budget compliance (10% of total score)
  if (metrics.cost <= challenge.budget) {
    score += 10;
    feedback.push(`✓ Budget met: $${metrics.cost.toFixed(0)} ≤ $${challenge.budget}`);
  } else {
    score -= 5;
    violations.push(`Budget exceeded: $${metrics.cost.toFixed(0)} > $${challenge.budget}`);
  }

  // Architecture quality bonus (proportional to system complexity)
  const hasLoadBalancer = componentTypes.some(type => 
    type.includes('load-balancer') || type.includes('api-gateway')
  );
  const hasDatabase = componentTypes.some(type => 
    type.includes('database') || type.includes('db') || type.includes('cache')
  );
  const hasCaching = componentTypes.some(type => 
    type.includes('cache') || type.includes('redis') || type.includes('memcached')
  );
  const hasMonitoring = componentTypes.some(type => 
    type.includes('monitoring') || type.includes('metrics') || type.includes('logging')
  );

  let architectureBonus = 0;
  if (hasLoadBalancer) {
    architectureBonus += 3;
    feedback.push('✓ Load balancing present');
  }
  if (hasDatabase) {
    architectureBonus += 3;
    feedback.push('✓ Data persistence layer present');
  }
  if (hasCaching) {
    architectureBonus += 2;
    feedback.push('✓ Caching layer present');
  }
  if (hasMonitoring) {
    architectureBonus += 2;
    feedback.push('✓ Monitoring/observability present');
  }

  score += architectureBonus;

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
