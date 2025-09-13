# System Design Simulator

A drag-and-drop system design simulator for interview preparation. Build, simulate, and learn system design patterns through interactive challenges.

## Features

### 🎯 Interactive Learning
- **Drag & Drop Interface**: Build system designs by dragging components onto the canvas
- **Real-time Simulation**: See metrics change as you add/remove components
- **Instant Feedback**: Get immediate scores and recommendations

### 🧩 Component Library
- **API Gateway**: Entry point with rate limiting and routing
- **Load Balancer**: Traffic distribution across instances
- **Web Applications**: Business logic servers with configurable replicas
- **Databases**: Primary and read replicas with availability calculations
- **Caching**: Redis-style in-memory cache with TTL support
- **Object Storage**: S3-style storage for files and large data
- **Message Queues**: Asynchronous processing and decoupling
- **Search Engine**: Elasticsearch-style full-text search
- **CDN**: Content delivery network for static assets

### 📊 Metrics & Scoring
- **Latency Analysis**: P50, P95, P99 latency calculations
- **Availability**: System reliability based on component configurations
- **Cost Optimization**: Monthly infrastructure cost tracking
- **Throughput**: Request handling capacity analysis
- **SLA Compliance**: Automatic checking against challenge requirements

### 🎮 Challenge System
- **Progressive Levels**: From beginner to expert challenges
- **Real-world Scenarios**: Image sharing, social feeds, e-commerce platforms
- **Requirements Tracking**: Must-have components and anti-pattern detection
- **Hints & Guidance**: Contextual help for each challenge

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to `http://localhost:5173`

## How to Use

1. **Select a Challenge**: Choose from the available challenges in the left panel
2. **Drag Components**: Drag components from the palette to the canvas
3. **Connect Components**: Draw connections between components to define data flow
4. **Run Simulation**: Click "Run Simulation" to see metrics and get feedback
5. **Iterate & Improve**: Use feedback to optimize your design and improve your score

## Challenge Examples

### Level 1: Image Sharing Platform
- **Goal**: Design for 2M DAU with 15k RPS
- **Requirements**: CDN, Cache, Read Replicas, Object Store
- **Constraints**: <$3k/month, <300ms latency, 99.9% uptime

### Level 2: Social Media Feed
- **Goal**: Handle 10M DAU with 50k RPS
- **Requirements**: Cache, Queue, Read Replicas, Load Balancer
- **Constraints**: <$5k/month, <200ms latency, 99.99% uptime

### Level 3: E-commerce Platform
- **Goal**: Support 5M DAU with 25k RPS
- **Requirements**: Search Engine, Cache, Queue, Database
- **Constraints**: <$4k/month, <150ms latency, 99.95% uptime

## Technical Architecture

- **Frontend**: React + TypeScript + ReactFlow
- **State Management**: React hooks with local state
- **Simulation Engine**: Deterministic calculations for realistic metrics
- **Component System**: Extensible schema for adding new components

## Contributing

This is an MVP focused on core functionality. Future enhancements could include:
- More component types and configurations
- Advanced simulation algorithms
- Multi-user collaboration
- Export/import functionality
- AI-powered recommendations

## License

MIT License - feel free to use and modify for your own projects.

