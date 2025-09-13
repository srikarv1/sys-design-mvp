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
  },
  {
    id: 'c4',
    title: 'Video Streaming Service',
    prompt: 'Design Netflix-like streaming for 20M DAU',
    description: 'Build a video streaming platform with content delivery, transcoding, and recommendation engine.',
    trafficProfile: { 
      rps: 100000, 
      readRatio: 0.95, 
      payloadSize: 5 * 1024 * 1024, // 5MB
      peakMultiplier: 6 
    },
    budget: 15000,
    sla: {
      maxLatency: 1000,
      minAvailability: 0.9999
    },
    mustHaves: ['CDN', 'Transcoding', 'Recommendation Engine', 'Cache'],
    antiPatterns: ['No CDN', 'Single Server', 'No Transcoding'],
    level: 4,
    hints: [
      'Use global CDN for video delivery',
      'Implement adaptive bitrate streaming',
      'Add recommendation engine for personalization',
      'Cache metadata and thumbnails aggressively'
    ]
  },
  {
    id: 'c5',
    title: 'Real-time Chat System',
    prompt: 'Design WhatsApp-like chat for 50M DAU',
    description: 'Build a real-time messaging system with instant delivery and message history.',
    trafficProfile: { 
      rps: 200000, 
      readRatio: 0.6, 
      payloadSize: 1024, // 1KB
      peakMultiplier: 8 
    },
    budget: 8000,
    sla: {
      maxLatency: 50,
      minAvailability: 0.9999
    },
    mustHaves: ['WebSocket', 'Message Queue', 'Database', 'Load Balancer'],
    antiPatterns: ['No WebSocket', 'Single Server', 'No Message Queue'],
    level: 4,
    hints: [
      'Use WebSocket for real-time communication',
      'Implement message queues for reliability',
      'Add message history storage',
      'Consider horizontal scaling for WebSocket connections'
    ]
  },
  {
    id: 'c6',
    title: 'Ride-Sharing Platform',
    prompt: 'Design Uber-like service for 10M DAU',
    description: 'Build a location-based service with real-time matching and payment processing.',
    trafficProfile: { 
      rps: 75000, 
      readRatio: 0.5, 
      payloadSize: 2048, // 2KB
      peakMultiplier: 5 
    },
    budget: 12000,
    sla: {
      maxLatency: 100,
      minAvailability: 0.9995
    },
    mustHaves: ['Geospatial Database', 'Real-time Matching', 'Payment Gateway', 'Cache'],
    antiPatterns: ['No Geospatial', 'Single Database', 'No Real-time'],
    level: 5,
    hints: [
      'Use geospatial database for location queries',
      'Implement real-time matching algorithms',
      'Add payment gateway integration',
      'Cache frequently accessed location data'
    ]
  },
  {
    id: 'c7',
    title: 'Banking System',
    prompt: 'Design online banking for 2M DAU',
    description: 'Build a secure financial platform with transactions, fraud detection, and compliance.',
    trafficProfile: { 
      rps: 15000, 
      readRatio: 0.8, 
      payloadSize: 512, // 512B
      peakMultiplier: 2 
    },
    budget: 6000,
    sla: {
      maxLatency: 200,
      minAvailability: 0.99999
    },
    mustHaves: ['Database', 'Security', 'Audit Logs', 'Encryption'],
    antiPatterns: ['No Security', 'No Audit', 'Single Database'],
    level: 5,
    hints: [
      'Implement strong security measures',
      'Add comprehensive audit logging',
      'Use encryption for sensitive data',
      'Consider database replication for high availability'
    ]
  },
  {
    id: 'c8',
    title: 'IoT Data Platform',
    prompt: 'Design IoT platform for 1M devices',
    description: 'Build a system to collect, process, and analyze data from millions of IoT devices.',
    trafficProfile: { 
      rps: 500000, 
      readRatio: 0.3, 
      payloadSize: 256, // 256B
      peakMultiplier: 10 
    },
    budget: 10000,
    sla: {
      maxLatency: 500,
      minAvailability: 0.999
    },
    mustHaves: ['Message Queue', 'Time Series DB', 'Stream Processing', 'Monitoring'],
    antiPatterns: ['No Queue', 'No Time Series', 'No Stream Processing'],
    level: 4,
    hints: [
      'Use message queues for high-throughput ingestion',
      'Implement time series database for metrics',
      'Add stream processing for real-time analytics',
      'Monitor system health and performance'
    ]
  },
  {
    id: 'c9',
    title: 'Gaming Platform',
    prompt: 'Design multiplayer gaming for 5M DAU',
    description: 'Build a gaming platform with real-time multiplayer, leaderboards, and social features.',
    trafficProfile: { 
      rps: 100000, 
      readRatio: 0.4, 
      payloadSize: 1024, // 1KB
      peakMultiplier: 7 
    },
    budget: 9000,
    sla: {
      maxLatency: 20,
      minAvailability: 0.999
    },
    mustHaves: ['Game Server', 'Real-time Sync', 'Leaderboard', 'Cache'],
    antiPatterns: ['No Game Server', 'No Real-time', 'Single Server'],
    level: 5,
    hints: [
      'Implement dedicated game servers',
      'Use real-time synchronization for multiplayer',
      'Add leaderboard system with caching',
      'Consider regional game servers for low latency'
    ]
  },
  {
    id: 'c10',
    title: 'AI/ML Platform',
    prompt: 'Design ML platform for 1M DAU',
    description: 'Build a machine learning platform with model training, inference, and data pipelines.',
    trafficProfile: { 
      rps: 30000, 
      readRatio: 0.6, 
      payloadSize: 10 * 1024, // 10KB
      peakMultiplier: 4 
    },
    budget: 20000,
    sla: {
      maxLatency: 2000,
      minAvailability: 0.999
    },
    mustHaves: ['ML Pipeline', 'Model Store', 'Feature Store', 'Monitoring'],
    antiPatterns: ['No Pipeline', 'No Model Store', 'No Feature Store'],
    level: 5,
    hints: [
      'Implement ML pipeline for training and inference',
      'Add model versioning and storage',
      'Create feature store for data management',
      'Monitor model performance and drift'
    ]
  }
];
