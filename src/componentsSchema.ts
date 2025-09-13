export interface ComponentParams {
  replicas?: number;
  size?: 'small' | 'medium' | 'large';
  region?: 'single' | 'multi';
  ttl?: number;
  partitions?: number;
  readReplicas?: number;
  [key: string]: any;
}

export interface ComponentType {
  id: string;
  name: string;
  category: 'edge' | 'app' | 'storage' | 'integration' | 'search' | 'cdn' | 'security' | 'monitoring' | 'ai' | 'gaming';
  defaultParams: ComponentParams;
  latencyFn: (params: ComponentParams, traffic: TrafficProfile) => number;
  costFn: (params: ComponentParams, traffic: TrafficProfile) => number;
  availabilityFn: (params: ComponentParams) => number;
  maxConnections?: number;
  allowedConnections?: string[];
  description: string;
}

export interface TrafficProfile {
  rps: number;
  readRatio: number;
  payloadSize: number; // bytes
  peakMultiplier: number;
}

export interface PlacedComponent {
  id: string;
  typeId: string;
  params: ComponentParams;
  position: { x: number; y: number };
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  protocol: 'http' | 'tcp' | 'udp' | 'grpc';
  capacity: number; // requests per second
}

export const components: ComponentType[] = [
  {
    id: 'api',
    name: 'API Gateway',
    category: 'edge',
    defaultParams: { replicas: 2 },
    latencyFn: (params, traffic) => 5 + (traffic.rps / 1000), // 5ms base + load scaling
    costFn: (params, traffic) => (params.replicas || 2) * 50 + (traffic.rps * 0.001),
    availabilityFn: (params) => 0.9999,
    maxConnections: 10,
    allowedConnections: ['web', 'cache', 'db', 'queue'],
    description: 'Entry point for all API requests with rate limiting and routing'
  },
  {
    id: 'web',
    name: 'Web App',
    category: 'app',
    defaultParams: { replicas: 3 },
    latencyFn: (params, traffic) => 20 + (traffic.rps / (params.replicas || 1) / 100),
    costFn: (params, traffic) => (params.replicas || 3) * 100 + (traffic.rps * 0.002),
    availabilityFn: (params) => 0.999,
    maxConnections: 5,
    allowedConnections: ['cache', 'db', 'queue', 'search'],
    description: 'Application server handling business logic'
  },
  {
    id: 'cache',
    name: 'Cache (Redis)',
    category: 'storage',
    defaultParams: { size: 'medium', ttl: 3600 },
    latencyFn: (params, traffic) => {
      const baseLatency = params.size === 'small' ? 1 : params.size === 'medium' ? 2 : 5;
      return baseLatency + (traffic.rps * 0.0001);
    },
    costFn: (params, traffic) => {
      const sizeMultiplier = params.size === 'small' ? 1 : params.size === 'medium' ? 2 : 4;
      return sizeMultiplier * 80 + (traffic.rps * 0.0005);
    },
    availabilityFn: (params) => 0.9995,
    maxConnections: 8,
    allowedConnections: ['web', 'api'],
    description: 'In-memory cache for hot data with TTL support'
  },
  {
    id: 'db',
    name: 'Database (PostgreSQL)',
    category: 'storage',
    defaultParams: { replicas: 1, readReplicas: 2 },
    latencyFn: (params, traffic) => {
      const readLatency = 10 + (traffic.rps * traffic.readRatio / ((params.readReplicas || 0) + 1) / 50);
      const writeLatency = 15 + (traffic.rps * (1 - traffic.readRatio) / (params.replicas || 1) / 30);
      return readLatency * traffic.readRatio + writeLatency * (1 - traffic.readRatio);
    },
    costFn: (params, traffic) => {
      const totalReplicas = (params.replicas || 1) + (params.readReplicas || 0);
      return totalReplicas * 200 + (traffic.rps * 0.01);
    },
    availabilityFn: (params) => {
      const replicas = (params.replicas || 1) + (params.readReplicas || 0);
      return 1 - Math.pow(0.01, replicas); // 99% per replica
    },
    maxConnections: 6,
    allowedConnections: ['web', 'api'],
    description: 'Primary database with read replicas for scaling reads'
  },
  {
    id: 'object',
    name: 'Object Store (S3)',
    category: 'storage',
    defaultParams: { region: 'multi' },
    latencyFn: (params, traffic) => 50 + (traffic.rps * 0.001),
    costFn: (params, traffic) => {
      const regionMultiplier = params.region === 'multi' ? 1.5 : 1;
      return regionMultiplier * 100 + (traffic.rps * 0.005);
    },
    availabilityFn: (params) => params.region === 'multi' ? 0.9999 : 0.999,
    maxConnections: 4,
    allowedConnections: ['web', 'api'],
    description: 'Object storage for files, images, and large data'
  },
  {
    id: 'queue',
    name: 'Message Queue',
    category: 'integration',
    defaultParams: { ttl: 3600 },
    latencyFn: (params, traffic) => 5 + (traffic.rps * 0.0001),
    costFn: (params, traffic) => 60 + (traffic.rps * 0.001),
    availabilityFn: (params) => 0.9995,
    maxConnections: 6,
    allowedConnections: ['web', 'api'],
    description: 'Asynchronous message processing for decoupling services'
  },
  {
    id: 'search',
    name: 'Search Engine (Elasticsearch)',
    category: 'search',
    defaultParams: { replicas: 2 },
    latencyFn: (params, traffic) => 30 + (traffic.rps / (params.replicas || 1) / 20),
    costFn: (params, traffic) => (params.replicas || 2) * 150 + (traffic.rps * 0.003),
    availabilityFn: (params) => 0.999,
    maxConnections: 4,
    allowedConnections: ['web', 'api'],
    description: 'Full-text search and indexing service'
  },
  {
    id: 'cdn',
    name: 'CDN',
    category: 'cdn',
    defaultParams: { replicas: 1 },
    latencyFn: (params, traffic) => 10 + (traffic.rps * 0.0001),
    costFn: (params, traffic) => 40 + (traffic.rps * 0.002),
    availabilityFn: (params) => 0.9999,
    maxConnections: 3,
    allowedConnections: ['object', 'web'],
    description: 'Content delivery network for static assets and caching'
  },
  {
    id: 'lb',
    name: 'Load Balancer',
    category: 'edge',
    defaultParams: { replicas: 1 },
    latencyFn: (params, traffic) => 2 + (traffic.rps * 0.0001),
    costFn: (params, traffic) => 30 + (traffic.rps * 0.0005),
    availabilityFn: (params) => 0.9999,
    maxConnections: 8,
    allowedConnections: ['web', 'api'],
    description: 'Distributes traffic across multiple instances'
  },
  // Additional Edge Components
  {
    id: 'waf',
    name: 'Web Application Firewall',
    category: 'security',
    defaultParams: { replicas: 1 },
    latencyFn: (params, traffic) => 3 + (traffic.rps * 0.0001),
    costFn: (params, traffic) => 25 + (traffic.rps * 0.0003),
    availabilityFn: (params) => 0.9999,
    maxConnections: 5,
    allowedConnections: ['api', 'lb'],
    description: 'Security layer protecting against web attacks'
  },
  {
    id: 'dns',
    name: 'DNS Server',
    category: 'edge',
    defaultParams: { replicas: 1 },
    latencyFn: (params, traffic) => 1 + (traffic.rps * 0.00005),
    costFn: (params, traffic) => 20 + (traffic.rps * 0.0001),
    availabilityFn: (params) => 0.9999,
    maxConnections: 3,
    allowedConnections: ['lb', 'api'],
    description: 'Domain name resolution service'
  },
  // Additional App Components
  {
    id: 'microservice',
    name: 'Microservice',
    category: 'app',
    defaultParams: { replicas: 2 },
    latencyFn: (params, traffic) => 15 + (traffic.rps / (params.replicas || 1) / 80),
    costFn: (params, traffic) => (params.replicas || 2) * 80 + (traffic.rps * 0.0015),
    availabilityFn: (params) => 0.999,
    maxConnections: 4,
    allowedConnections: ['cache', 'db', 'queue'],
    description: 'Specialized service handling specific business logic'
  },
  {
    id: 'websocket',
    name: 'WebSocket Server',
    category: 'app',
    defaultParams: { replicas: 3 },
    latencyFn: (params, traffic) => 5 + (traffic.rps / (params.replicas || 1) / 200),
    costFn: (params, traffic) => (params.replicas || 3) * 90 + (traffic.rps * 0.001),
    availabilityFn: (params) => 0.999,
    maxConnections: 3,
    allowedConnections: ['cache', 'queue'],
    description: 'Real-time bidirectional communication server'
  },
  {
    id: 'auth',
    name: 'Authentication Service',
    category: 'app',
    defaultParams: { replicas: 2 },
    latencyFn: (params, traffic) => 10 + (traffic.rps / (params.replicas || 1) / 100),
    costFn: (params, traffic) => (params.replicas || 2) * 70 + (traffic.rps * 0.001),
    availabilityFn: (params) => 0.9995,
    maxConnections: 3,
    allowedConnections: ['cache', 'db'],
    description: 'User authentication and authorization service'
  },
  // Additional Storage Components
  {
    id: 'timeseries',
    name: 'Time Series Database',
    category: 'storage',
    defaultParams: { replicas: 2 },
    latencyFn: (params, traffic) => 8 + (traffic.rps / (params.replicas || 1) / 100),
    costFn: (params, traffic) => (params.replicas || 2) * 120 + (traffic.rps * 0.002),
    availabilityFn: (params) => 0.999,
    maxConnections: 4,
    allowedConnections: ['web', 'api'],
    description: 'Optimized for time-stamped data and metrics'
  },
  {
    id: 'graphdb',
    name: 'Graph Database',
    category: 'storage',
    defaultParams: { replicas: 2 },
    latencyFn: (params, traffic) => 25 + (traffic.rps / (params.replicas || 1) / 50),
    costFn: (params, traffic) => (params.replicas || 2) * 180 + (traffic.rps * 0.004),
    availabilityFn: (params) => 0.999,
    maxConnections: 3,
    allowedConnections: ['web', 'api'],
    description: 'Database optimized for complex relationships'
  },
  {
    id: 'documentdb',
    name: 'Document Database',
    category: 'storage',
    defaultParams: { replicas: 2 },
    latencyFn: (params, traffic) => 12 + (traffic.rps / (params.replicas || 1) / 60),
    costFn: (params, traffic) => (params.replicas || 2) * 140 + (traffic.rps * 0.003),
    availabilityFn: (params) => 0.999,
    maxConnections: 4,
    allowedConnections: ['web', 'api'],
    description: 'NoSQL database for flexible document storage'
  },
  {
    id: 'keyvalue',
    name: 'Key-Value Store',
    category: 'storage',
    defaultParams: { replicas: 2 },
    latencyFn: (params, traffic) => 2 + (traffic.rps / (params.replicas || 1) / 200),
    costFn: (params, traffic) => (params.replicas || 2) * 60 + (traffic.rps * 0.001),
    availabilityFn: (params) => 0.9995,
    maxConnections: 6,
    allowedConnections: ['web', 'api'],
    description: 'High-performance key-value storage'
  },
  // Integration Components
  {
    id: 'eventbus',
    name: 'Event Bus',
    category: 'integration',
    defaultParams: { replicas: 2 },
    latencyFn: (params, traffic) => 3 + (traffic.rps * 0.0001),
    costFn: (params, traffic) => (params.replicas || 2) * 50 + (traffic.rps * 0.0008),
    availabilityFn: (params) => 0.9995,
    maxConnections: 8,
    allowedConnections: ['web', 'api', 'microservice'],
    description: 'Event-driven architecture messaging system'
  },
  {
    id: 'stream',
    name: 'Stream Processor',
    category: 'integration',
    defaultParams: { replicas: 2 },
    latencyFn: (params, traffic) => 20 + (traffic.rps / (params.replicas || 1) / 40),
    costFn: (params, traffic) => (params.replicas || 2) * 100 + (traffic.rps * 0.002),
    availabilityFn: (params) => 0.999,
    maxConnections: 4,
    allowedConnections: ['queue', 'timeseries'],
    description: 'Real-time data stream processing'
  },
  {
    id: 'etl',
    name: 'ETL Pipeline',
    category: 'integration',
    defaultParams: { replicas: 1 },
    latencyFn: (params, traffic) => 100 + (traffic.rps * 0.001),
    costFn: (params, traffic) => 80 + (traffic.rps * 0.001),
    availabilityFn: (params) => 0.99,
    maxConnections: 3,
    allowedConnections: ['db', 'object'],
    description: 'Extract, Transform, Load data processing'
  },
  // Search Components
  {
    id: 'vector',
    name: 'Vector Database',
    category: 'search',
    defaultParams: { replicas: 2 },
    latencyFn: (params, traffic) => 50 + (traffic.rps / (params.replicas || 1) / 30),
    costFn: (params, traffic) => (params.replicas || 2) * 200 + (traffic.rps * 0.005),
    availabilityFn: (params) => 0.999,
    maxConnections: 3,
    allowedConnections: ['web', 'api'],
    description: 'Vector similarity search for AI/ML applications'
  },
  {
    id: 'recommendation',
    name: 'Recommendation Engine',
    category: 'search',
    defaultParams: { replicas: 2 },
    latencyFn: (params, traffic) => 100 + (traffic.rps / (params.replicas || 1) / 20),
    costFn: (params, traffic) => (params.replicas || 2) * 250 + (traffic.rps * 0.008),
    availabilityFn: (params) => 0.999,
    maxConnections: 4,
    allowedConnections: ['cache', 'db'],
    description: 'AI-powered recommendation system'
  },
  // CDN Components
  {
    id: 'edge',
    name: 'Edge Server',
    category: 'cdn',
    defaultParams: { replicas: 1 },
    latencyFn: (params, traffic) => 5 + (traffic.rps * 0.0001),
    costFn: (params, traffic) => 35 + (traffic.rps * 0.0015),
    availabilityFn: (params) => 0.9999,
    maxConnections: 4,
    allowedConnections: ['cdn', 'object'],
    description: 'Edge computing server for low-latency processing'
  },
  // Specialized Components
  {
    id: 'transcoding',
    name: 'Video Transcoding',
    category: 'app',
    defaultParams: { replicas: 2 },
    latencyFn: (params, traffic) => 2000 + (traffic.rps / (params.replicas || 1) / 10),
    costFn: (params, traffic) => (params.replicas || 2) * 300 + (traffic.rps * 0.01),
    availabilityFn: (params) => 0.999,
    maxConnections: 3,
    allowedConnections: ['object', 'queue'],
    description: 'Video format conversion and optimization'
  },
  {
    id: 'geospatial',
    name: 'Geospatial Database',
    category: 'storage',
    defaultParams: { replicas: 2 },
    latencyFn: (params, traffic) => 30 + (traffic.rps / (params.replicas || 1) / 40),
    costFn: (params, traffic) => (params.replicas || 2) * 160 + (traffic.rps * 0.003),
    availabilityFn: (params) => 0.999,
    maxConnections: 3,
    allowedConnections: ['web', 'api'],
    description: 'Location-based data storage and queries'
  },
  {
    id: 'payment',
    name: 'Payment Gateway',
    category: 'integration',
    defaultParams: { replicas: 2 },
    latencyFn: (params, traffic) => 100 + (traffic.rps / (params.replicas || 1) / 50),
    costFn: (params, traffic) => (params.replicas || 2) * 120 + (traffic.rps * 0.005),
    availabilityFn: (params) => 0.9999,
    maxConnections: 2,
    allowedConnections: ['web', 'api'],
    description: 'Secure payment processing service'
  },
  {
    id: 'monitoring',
    name: 'Monitoring System',
    category: 'monitoring',
    defaultParams: { replicas: 1 },
    latencyFn: (params, traffic) => 5 + (traffic.rps * 0.0001),
    costFn: (params, traffic) => 40 + (traffic.rps * 0.0005),
    availabilityFn: (params) => 0.999,
    maxConnections: 10,
    allowedConnections: ['web', 'api', 'db', 'cache'],
    description: 'System health monitoring and alerting'
  },
  {
    id: 'logging',
    name: 'Logging System',
    category: 'monitoring',
    defaultParams: { replicas: 1 },
    latencyFn: (params, traffic) => 2 + (traffic.rps * 0.0001),
    costFn: (params, traffic) => 30 + (traffic.rps * 0.0003),
    availabilityFn: (params) => 0.999,
    maxConnections: 10,
    allowedConnections: ['web', 'api', 'db'],
    description: 'Centralized logging and log analysis'
  },
  {
    id: 'ml',
    name: 'ML Inference Server',
    category: 'ai',
    defaultParams: { replicas: 2 },
    latencyFn: (params, traffic) => 500 + (traffic.rps / (params.replicas || 1) / 20),
    costFn: (params, traffic) => (params.replicas || 2) * 400 + (traffic.rps * 0.02),
    availabilityFn: (params) => 0.999,
    maxConnections: 3,
    allowedConnections: ['cache', 'db'],
    description: 'Machine learning model inference service'
  },
  {
    id: 'gameserver',
    name: 'Game Server',
    category: 'gaming',
    defaultParams: { replicas: 3 },
    latencyFn: (params, traffic) => 10 + (traffic.rps / (params.replicas || 1) / 100),
    costFn: (params, traffic) => (params.replicas || 3) * 150 + (traffic.rps * 0.003),
    availabilityFn: (params) => 0.999,
    maxConnections: 4,
    allowedConnections: ['cache', 'db', 'queue'],
    description: 'Dedicated game server for multiplayer games'
  },
  {
    id: 'leaderboard',
    name: 'Leaderboard Service',
    category: 'gaming',
    defaultParams: { replicas: 2 },
    latencyFn: (params, traffic) => 5 + (traffic.rps / (params.replicas || 1) / 200),
    costFn: (params, traffic) => (params.replicas || 2) * 80 + (traffic.rps * 0.001),
    availabilityFn: (params) => 0.9995,
    maxConnections: 3,
    allowedConnections: ['cache', 'db'],
    description: 'Real-time leaderboard and ranking system'
  }
];
