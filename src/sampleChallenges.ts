import { TrafficProfile } from './componentsSchema';

export interface Challenge {
  id: string;
  title: string;
  prompt: string;
  description: string;
  trafficProfile: TrafficProfile;
  budget: number;
  sla: {
    maxLatency: number; // ms
    minAvailability: number; // 0-1
  };
  mustHaves: string[];
  antiPatterns: string[];
  level: number;
  hints: string[];
}

export const sampleChallenges: Challenge[] = [
  {
    id: 'c1',
    title: 'Image Sharing Platform',
    prompt: 'Design image sharing for 2M DAU',
    description: 'Build a system for users to upload, store, and share images. Focus on handling high read traffic and optimizing for cost.',
    trafficProfile: { 
      rps: 15000, 
      readRatio: 0.8, 
      payloadSize: 1024 * 1024, // 1MB
      peakMultiplier: 3 
    },
    budget: 3000,
    sla: {
      maxLatency: 300,
      minAvailability: 0.999
    },
    mustHaves: ['CDN', 'Cache', 'Read Replicas', 'Object Store'],
    antiPatterns: ['Single-AZ DB', 'No CDN', 'Cache-as-sole-storage'],
    level: 1,
    hints: [
      'Use CDN to serve static images globally',
      'Implement cache-aside pattern for metadata',
      'Add read replicas to scale read operations',
      'Consider object storage for large files'
    ]
  },
  {
    id: 'c2',
    title: 'Social Media Feed',
    prompt: 'Design feed for 10M DAU',
    description: 'Create a timeline feed system that can handle massive read traffic with real-time updates.',
    trafficProfile: { 
      rps: 50000, 
      readRatio: 0.9, 
      payloadSize: 2048, // 2KB
      peakMultiplier: 5 
    },
    budget: 5000,
    sla: {
      maxLatency: 200,
      minAvailability: 0.9999
    },
    mustHaves: ['Cache', 'Queue', 'Read Replicas', 'Load Balancer'],
    antiPatterns: ['Cache-as-sole-storage', 'No Load Balancer', 'Single Point of Failure'],
    level: 2,
    hints: [
      'Implement fan-out pattern for timeline generation',
      'Use queues to handle write spikes',
      'Cache popular content aggressively',
      'Add multiple read replicas for scaling'
    ]
  },
  {
    id: 'c3',
    title: 'E-commerce Platform',
    prompt: 'Design e-commerce for 5M DAU',
    description: 'Build a shopping platform with product catalog, search, and order processing.',
    trafficProfile: { 
      rps: 25000, 
      readRatio: 0.7, 
      payloadSize: 512, // 512B
      peakMultiplier: 4 
    },
    budget: 4000,
    sla: {
      maxLatency: 150,
      minAvailability: 0.9995
    },
    mustHaves: ['Search Engine', 'Cache', 'Queue', 'Database'],
    antiPatterns: ['No Search', 'Single Database', 'No Caching'],
    level: 3,
    hints: [
      'Implement search engine for product discovery',
      'Cache product data and search results',
      'Use queues for order processing',
      'Consider database sharding for scale'
    ]
  }
];
