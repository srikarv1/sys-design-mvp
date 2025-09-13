import Anthropic from '@anthropic-ai/sdk';
import { SimulationResult } from '../simulate';
import { Challenge } from '../sampleChallenges';
import { PlacedComponent, Connection, components as componentCatalog } from '../componentsSchema';

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: (import.meta as any).env?.VITE_ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: true, // Required for browser usage
});

export interface ClaudeFeedback {
  pros: string[];
  cons: string[];
  detailedAnalysis: string;
  optimalSolution: string;
  architectureGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  costOptimization: string;
  scalabilityNotes: string;
  securityConsiderations: string;
}

export interface SystemAnalysis {
  hasBasicComponents: boolean;
  hasLoadBalancer: boolean;
  hasDatabase: boolean;
  hasCaching: boolean;
  hasMonitoring: boolean;
  hasSecurity: boolean;
  componentCount: number;
  connectionCount: number;
  hasRedundancy: boolean;
  estimatedComplexity: 'simple' | 'moderate' | 'complex';
}

class ClaudeFeedbackService {
  private cache = new Map<string, ClaudeFeedback>();
  private requestCount = 0;
  private readonly MAX_REQUESTS_PER_SESSION = 10; // Limit to conserve credits
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private testMode = true; // Test mode to bypass hard checks
  private readonly PROMPT_VERSION = 'v2';

  /**
   * Check if API key is configured
   */
  private isApiKeyConfigured(): boolean {
    const apiKey = (import.meta as any).env?.VITE_ANTHROPIC_API_KEY;
    console.log('🔑 API Key check:', {
      hasEnv: !!(import.meta as any).env,
      hasKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyStart: apiKey?.substring(0, 10) || 'none',
      keyEnd: apiKey?.substring(-10) || 'none',
      isValid: !!(apiKey && apiKey.trim() && !apiKey.includes('your_anthropic_api_key_here'))
    });
    return !!(apiKey && apiKey.trim() && !apiKey.includes('your_anthropic_api_key_here'));
  }

  /**
   * Hard checks before making API call to conserve credits
   */
  private shouldMakeApiCall(analysis: SystemAnalysis, challenge: Challenge): boolean {
    // Test mode bypasses all checks except API key
    if (this.testMode) {
      console.log('🧪 Test mode: bypassing hard checks');
      return this.isApiKeyConfigured();
    }

    // Check if API key is configured
    if (!this.isApiKeyConfigured()) {
      console.warn('Claude API key not configured');
      return false;
    }

    // Check request limit
    if (this.requestCount >= this.MAX_REQUESTS_PER_SESSION) {
      console.warn('Max API requests reached for this session');
      return false;
    }

    console.log('✅ All hard checks passed');
    return true;
  }

  /**
   * Analyze system design without API call
   */
  private analyzeSystem(components: PlacedComponent[], connections: Connection[]): SystemAnalysis {
    const componentTypes = components.map(c => c.typeId);
    
    return {
      hasBasicComponents: components.length > 0,
      hasLoadBalancer: componentTypes.some(type => 
        type.includes('load-balancer') || type.includes('api-gateway')
      ),
      hasDatabase: componentTypes.some(type => 
        type.includes('database') || type.includes('db') || type.includes('cache')
      ),
      hasCaching: componentTypes.some(type => 
        type.includes('cache') || type.includes('redis') || type.includes('memcached')
      ),
      hasMonitoring: componentTypes.some(type => 
        type.includes('monitoring') || type.includes('metrics') || type.includes('logging')
      ),
      hasSecurity: componentTypes.some(type => 
        type.includes('auth') || type.includes('security') || type.includes('firewall')
      ),
      componentCount: components.length,
      connectionCount: connections.length,
      hasRedundancy: this.checkRedundancy(components, connections),
      estimatedComplexity: this.estimateComplexity(components, connections)
    };
  }

  private checkRedundancy(components: PlacedComponent[], connections: Connection[]): boolean {
    // Simple redundancy check - look for multiple instances of same component type
    const componentTypeCounts = new Map<string, number>();
    components.forEach(comp => {
      const count = componentTypeCounts.get(comp.typeId) || 0;
      componentTypeCounts.set(comp.typeId, count + 1);
    });
    
    return Array.from(componentTypeCounts.values()).some(count => count > 1);
  }

  private estimateComplexity(components: PlacedComponent[], connections: Connection[]): 'simple' | 'moderate' | 'complex' {
    const componentCount = components.length;
    const connectionCount = connections.length;
    const complexityScore = componentCount + (connectionCount * 0.5);
    
    if (complexityScore < 5) return 'simple';
    if (complexityScore < 10) return 'moderate';
    return 'complex';
  }

  /**
   * Generate cache key for system design
   */
  private generateCacheKey(components: PlacedComponent[], challenge: Challenge): string {
    const componentIds = components.map(c => c.typeId).sort().join(',');
    return `${this.PROMPT_VERSION}-${challenge.id}-${componentIds}`;
  }

  /**
   * Get feedback from Claude API with caching and hard checks
   */
  async getFeedback(
    challenge: Challenge,
    components: PlacedComponent[],
    connections: Connection[],
    simulationResult: SimulationResult
  ): Promise<ClaudeFeedback> {
    console.log('🤖 getFeedback called with:', {
      challenge: challenge.title,
      componentCount: components.length,
      connectionCount: connections.length,
      score: simulationResult.score,
      testMode: this.testMode,
      requestCount: this.requestCount
    });

    const analysis = this.analyzeSystem(components, connections);
    const cacheKey = this.generateCacheKey(components, challenge);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - (cached as any).timestamp < this.CACHE_DURATION) {
      console.log('🤖 Using cached feedback');
      return cached;
    }

    // Hard checks before API call
    const shouldCall = this.shouldMakeApiCall(analysis, challenge);
    console.log('🤖 Should make API call:', shouldCall);
    
    if (!shouldCall) {
      console.log('🤖 Skipping Claude call due to hard checks, using basic feedback');
      console.log('🤖 Hard check details:', {
        testMode: this.testMode,
        apiKeyConfigured: this.isApiKeyConfigured(),
        requestCount: this.requestCount,
        maxRequests: this.MAX_REQUESTS_PER_SESSION
      });
      return this.generateBasicFeedback(analysis, challenge, simulationResult);
    }

    try {
      this.requestCount++;
      console.log('🤖 Making Claude API call, request count:', this.requestCount);
      const feedback = await this.callClaudeAPI(challenge, components, connections, simulationResult, analysis);
      
      // Cache the result
      (feedback as any).timestamp = Date.now();
      this.cache.set(cacheKey, feedback);
      
      console.log('🤖 Claude feedback received and cached');
      return feedback;
    } catch (error) {
      console.error('🤖 Claude API error:', error);
      console.log('🤖 Error details:', {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorType: typeof error,
        stack: error instanceof Error ? error.stack : 'No stack'
      });
      console.log('🤖 Falling back to basic feedback due to API error');
      return this.generateBasicFeedback(analysis, challenge, simulationResult);
    }
  }

  /**
   * Generate basic feedback without API call
   */
  private generateBasicFeedback(
    analysis: SystemAnalysis,
    challenge: Challenge,
    simulationResult: SimulationResult
  ): ClaudeFeedback {
    const pros: string[] = [];
    const cons: string[] = [];

    // Component-specific analysis
    if (analysis.hasDatabase) {
      pros.push('✓ Includes data persistence layer');
    } else {
      cons.push('⚠️ Missing database layer - data cannot be stored persistently');
    }

    if (analysis.hasLoadBalancer) {
      pros.push('✓ Includes load balancing for traffic distribution');
    } else if (analysis.componentCount > 3) {
      cons.push('⚠️ Consider adding load balancer for scalability');
    }

    if (analysis.hasCaching) {
      pros.push('✓ Includes caching layer for performance optimization');
    } else {
      cons.push('💡 Consider adding caching for performance');
    }

    if (analysis.hasMonitoring) {
      pros.push('✓ Includes monitoring and observability components');
    } else {
      cons.push('⚠️ Missing monitoring - system health cannot be tracked');
    }

    if (analysis.hasSecurity) {
      pros.push('✓ Includes security components');
    } else {
      cons.push('⚠️ Missing security layers - system may be vulnerable');
    }

    if (analysis.hasRedundancy) {
      pros.push('✓ Shows redundancy awareness with multiple instances');
    } else if (analysis.componentCount > 4) {
      cons.push('⚠️ Consider adding redundancy for high availability');
    }

    if (analysis.componentCount < 3) {
      cons.push('⚠️ System is too simple for the challenge requirements');
    }

    // Grade based on local score
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (simulationResult.score >= 90) grade = 'A';
    else if (simulationResult.score >= 80) grade = 'B';
    else if (simulationResult.score >= 70) grade = 'C';
    else if (simulationResult.score >= 60) grade = 'D';
    else grade = 'F';

    // More detailed analysis based on actual components
    const componentDetails = analysis.componentCount > 0 ? 
      `Your system has ${analysis.componentCount} components with ${analysis.connectionCount} connections. ` : 
      'No components are currently placed. ';
    
    const complexityNote = analysis.estimatedComplexity === 'complex' ? 
      'The system shows good complexity for handling the challenge requirements.' :
      analysis.estimatedComplexity === 'moderate' ?
      'The system has moderate complexity - consider adding more components for better coverage.' :
      'The system is quite simple - more components may be needed for the challenge.';

    return {
      pros,
      cons,
      detailedAnalysis: `${componentDetails}${complexityNote} The system ${analysis.hasDatabase ? 'includes' : 'lacks'} data persistence, ${analysis.hasLoadBalancer ? 'has' : 'needs'} load balancing, and ${analysis.hasCaching ? 'includes' : 'could benefit from'} caching.`,
      optimalSolution: `For the "${challenge.title}" challenge, an optimal solution would include: ${challenge.mustHaves.join(', ')}, plus load balancing, database with replication, caching layer, monitoring, and security components.`,
      architectureGrade: grade,
      costOptimization: simulationResult.metrics.cost <= challenge.budget ? 
        `Within budget ($${simulationResult.metrics.cost.toFixed(0)} ≤ $${challenge.budget})` : 
        `Over budget ($${simulationResult.metrics.cost.toFixed(0)} > $${challenge.budget})`,
      scalabilityNotes: analysis.hasLoadBalancer ? 
        'Good scalability foundation with load balancing' : 
        'Consider adding load balancers and horizontal scaling components',
      securityConsiderations: analysis.hasSecurity ? 
        'Security components present - good security awareness' : 
        'Consider adding authentication, authorization, and network security layers'
    };
  }

  /**
   * Call Claude API for detailed analysis
   */
  private async callClaudeAPI(
    challenge: Challenge,
    placedComponents: PlacedComponent[],
    connections: Connection[],
    simulationResult: SimulationResult,
    analysis: SystemAnalysis
  ): Promise<ClaudeFeedback> {
    const componentDetails = placedComponents.map(c => {
      return `${c.typeId} (${c.params.replicas || 1} replicas)`;
    }).join(', ');

    const nodes = placedComponents.map(pc => {
      const meta = componentCatalog.find(ct => ct.id === pc.typeId);
      return {
        id: pc.id,
        typeId: pc.typeId,
        name: meta?.name || pc.typeId,
        category: meta?.category || 'unknown',
        params: pc.params
      };
    });

    const edges = connections.map(conn => ({
      id: conn.id,
      from: conn.fromId,
      to: conn.toId,
      protocol: conn.protocol,
      capacity: conn.capacity
    }));

    const ingressNodeIds = nodes.filter(n => n.category === 'edge').map(n => n.id);
    const storageNodeIds = nodes.filter(n => n.category === 'storage').map(n => n.id);

    const topologyJson = JSON.stringify({ nodes, edges, ingressNodeIds, storageNodeIds }, null, 2);

    const systemPrompt = `You are an expert system architect reviewing a system design. Provide comprehensive, topology-aware analysis. Base your reasoning ONLY on the provided topology and data.

CHALLENGE: ${challenge.title}
DESCRIPTION: ${challenge.description}
REQUIREMENTS: ${challenge.mustHaves.join(', ')}
ANTI-PATTERNS: ${challenge.antiPatterns.join(', ')}
SLA: Latency ≤ ${challenge.sla.maxLatency}ms, Availability ≥ ${(challenge.sla.minAvailability * 100).toFixed(1)}%
BUDGET: $${challenge.budget}

CURRENT DESIGN SUMMARY:
- Components: ${componentDetails}
- Total Components: ${placedComponents.length}
- Connections: ${connections.length}
- Current Metrics: P95 Latency ${simulationResult.metrics.latency.p95.toFixed(1)}ms, Availability ${(simulationResult.metrics.availability * 100).toFixed(2)}%, Cost $${simulationResult.metrics.cost.toFixed(0)}

TOPOLOGY (JSON):
${topologyJson}

ANALYSIS REQUIRED:
1. Pros: 3-5 strengths grounded in the actual topology and requirements.
2. Cons: 3-5 weaknesses or missing elements grounded in the topology.
3. Detailed Analysis: One comprehensive paragraph referencing specific nodes/paths and how the design meets or misses requirements.
4. Optimal Solution: One paragraph describing what an ideal solution would look like for this challenge.
5. Architecture Grade: A, B, C, D, or F based on overall design quality.
6. Cost Optimization: Specific recommendations for cost efficiency.
7. Scalability Notes: How well this scales and what's needed for growth.
8. Security Considerations: Security aspects and recommendations.

RESPOND WITH ONLY A SINGLE JSON OBJECT, NO EXTRA TEXT, NO MARKDOWN, NO CODE FENCES.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2", "con3"],
  "detailedAnalysis": "Comprehensive paragraph analysis...",
  "optimalSolution": "Paragraph describing ideal solution...",
  "architectureGrade": "B",
  "costOptimization": "Specific cost recommendations...",
  "scalabilityNotes": "Scalability assessment...",
  "securityConsiderations": "Security analysis and recommendations..."
}`;

    console.log('🤖 Calling Claude API with prompt:', systemPrompt.substring(0, 200) + '...');

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Use Haiku for cost efficiency
      max_tokens: 1500,
      temperature: 0.2,
      system: 'Return ONLY a single JSON object matching the requested schema. Do not include any commentary, markdown, or code fences.',
      messages: [
        {
          role: 'user',
          content: systemPrompt
        }
      ]
    });

    console.log('🤖 Claude API response received:', response);

    const content = response.content[0];
    if (content.type === 'text') {
      console.log('🤖 Claude response text:', content.text);
      try {
        // Try fenced JSON first
        const fencedMatch = content.text.match(/```(?:json)?\n([\s\S]*?)\n```/i);
        if (fencedMatch) {
          const fenced = fencedMatch[1].trim();
          const parsed = JSON.parse(fenced);
          console.log('🤖 Parsed Claude fenced JSON response:', parsed);
          return parsed;
        }

        // Then try first JSON object in the text
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const cleanedJson = jsonMatch[0]
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
          const parsed = JSON.parse(cleanedJson);
          console.log('🤖 Parsed Claude response:', parsed);
          return parsed;
        }
      } catch (error) {
        console.error('Failed to parse Claude response:', error);
        console.log('Raw response:', content.text);
        try {
          const fallbackResponse = this.parseClaudeResponseManually(content.text);
          if (fallbackResponse) {
            console.log('🤖 Using manual parsing fallback:', fallbackResponse);
            return fallbackResponse;
          }
        } catch (fallbackError) {
          console.error('Manual parsing also failed:', fallbackError);
        }
      }
    }

    // If JSON parsing fails, surface the error to the caller
    console.warn('🤖 Claude response could not be parsed');
    throw new Error('Claude response could not be parsed');
  }

  /**
   * Manual parsing fallback for Claude responses
   */
  private parseClaudeResponseManually(text: string): ClaudeFeedback | null {
    try {
      // If fenced, extract inner JSON
      const fencedMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/i);
      if (fencedMatch) {
        text = fencedMatch[1];
      }
      const extractField = (fieldName: string): string => {
        const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*(?:\\\\.[^"]*)*)"`, 'g');
        const match = regex.exec(text);
        return match ? match[1].replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t') : '';
      };
      const extractArray = (fieldName: string): string[] => {
        const regex = new RegExp(`"${fieldName}"\\s*:\\s*\[([^\]]+)\]`, 'g');
        const match = regex.exec(text);
        if (!match) return [];
        const arrayContent = match[1];
        const items = arrayContent.split(',').map(item => 
          item.trim().replace(/^"|"$/g, '').replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t')
        );
        return items;
      };
      const gradeMatch = text.match(/"architectureGrade"\s*:\s*"([A-F])"/);
      return {
        pros: extractArray('pros'),
        cons: extractArray('cons'),
        detailedAnalysis: extractField('detailedAnalysis'),
        optimalSolution: extractField('optimalSolution'),
        architectureGrade: (gradeMatch ? gradeMatch[1] : 'C') as 'A' | 'B' | 'C' | 'D' | 'F',
        costOptimization: extractField('costOptimization'),
        scalabilityNotes: extractField('scalabilityNotes'),
        securityConsiderations: extractField('securityConsiderations')
      };
    } catch (error) {
      console.error('Manual parsing failed:', error);
      return null;
    }
  }

  /**
   * Get current API usage stats
   */
  getUsageStats(): { requestsUsed: number; requestsRemaining: number; cacheSize: number } {
    return {
      requestsUsed: this.requestCount,
      requestsRemaining: this.MAX_REQUESTS_PER_SESSION - this.requestCount,
      cacheSize: this.cache.size
    };
  }

  /**
   * Reset usage stats (for new session)
   */
  resetUsage(): void {
    this.requestCount = 0;
    this.cache.clear();
  }

  /**
   * Enable test mode (bypasses hard checks)
   */
  enableTestMode(): void {
    this.testMode = true;
    console.log('🧪 Test mode enabled - hard checks bypassed');
  }

  /**
   * Disable test mode
   */
  disableTestMode(): void {
    this.testMode = false;
    console.log('🧪 Test mode disabled - hard checks active');
  }

  /**
   * Get test mode status
   */
  isTestMode(): boolean {
    return this.testMode;
  }

  /**
   * Force enable test mode for debugging
   */
  forceTestMode(): void {
    this.testMode = true;
    console.log('🧪 Test mode force enabled for debugging');
  }

  /**
   * Test Claude API with a simple request
   */
  async testClaudeAPI(): Promise<boolean> {
    try {
      console.log('🧪 Testing Claude API...');
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        temperature: 0.2,
        messages: [
          {
            role: 'user',
            content: 'Say "Hello, Claude is working!" and nothing else.'
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        console.log('🧪 Claude API test successful:', content.text);
        return true;
      }
      return false;
    } catch (error) {
      console.error('🧪 Claude API test failed:', error);
      return false;
    }
  }
}

export const claudeFeedbackService = new ClaudeFeedbackService();
