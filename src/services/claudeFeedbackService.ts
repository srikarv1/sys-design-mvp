import Anthropic from '@anthropic-ai/sdk';
import { SimulationResult } from '../simulate';
import { Challenge } from '../sampleChallenges';
import { PlacedComponent, Connection } from '../componentsSchema';

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: (import.meta as any).env?.VITE_ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: true, // Required for browser usage
});

export interface ClaudeFeedback {
  score: number;
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
  private testMode = false; // Test mode to bypass hard checks

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
      keyEnd: apiKey?.substring(-10) || 'none'
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

    // Don't make API call if system is too simple
    if (analysis.componentCount < 3) {
      console.log('🚫 Hard check failed: Need 3+ components, have', analysis.componentCount);
      return false;
    }

    // Don't make API call if missing critical components
    if (!analysis.hasDatabase && challenge.mustHaves.some(have => 
      have.toLowerCase().includes('database') || have.toLowerCase().includes('db')
    )) {
      console.log('🚫 Hard check failed: Missing required database component');
      return false;
    }

    // Don't make API call if system is too basic
    if (analysis.estimatedComplexity === 'simple' && analysis.componentCount < 5) {
      console.log('🚫 Hard check failed: Simple system needs 5+ components, have', analysis.componentCount);
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
    return `${challenge.id}-${componentIds}`;
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
      score: simulationResult.score
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
      console.log('🤖 Using basic feedback due to hard checks');
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
    let score = simulationResult.score;

    // Basic analysis
    if (analysis.hasDatabase) {
      pros.push('✓ Includes data persistence layer');
    } else {
      cons.push('⚠️ Missing database layer');
      score -= 5;
    }

    if (analysis.hasLoadBalancer) {
      pros.push('✓ Includes load balancing');
    } else if (analysis.componentCount > 3) {
      cons.push('⚠️ Consider adding load balancer for scalability');
      score -= 3;
    }

    if (analysis.hasCaching) {
      pros.push('✓ Includes caching layer');
    } else {
      cons.push('💡 Consider adding caching for performance');
    }

    if (analysis.hasRedundancy) {
      pros.push('✓ Shows redundancy awareness');
    } else if (analysis.componentCount > 4) {
      cons.push('⚠️ Consider adding redundancy for high availability');
      score -= 3;
    }

    if (analysis.componentCount < 3) {
      cons.push('⚠️ System is too simple for the challenge');
      score -= 10;
    }

    // Grade based on score
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    return {
      score: Math.max(0, Math.min(100, score)),
      pros,
      cons,
      detailedAnalysis: `Basic analysis: ${analysis.componentCount} components, ${analysis.connectionCount} connections. ${analysis.estimatedComplexity} complexity.`,
      optimalSolution: `For this challenge, an optimal solution would include a load balancer, database with replication, caching layer, monitoring, and security components. Consider adding more components for better analysis.`,
      architectureGrade: grade,
      costOptimization: simulationResult.metrics.cost <= challenge.budget ? 'Within budget' : 'Over budget',
      scalabilityNotes: analysis.hasLoadBalancer ? 'Good scalability foundation' : 'Consider scalability improvements',
      securityConsiderations: analysis.hasSecurity ? 'Security components present' : 'Consider adding security layers'
    };
  }

  /**
   * Call Claude API for detailed analysis
   */
  private async callClaudeAPI(
    challenge: Challenge,
    components: PlacedComponent[],
    connections: Connection[],
    simulationResult: SimulationResult,
    analysis: SystemAnalysis
  ): Promise<ClaudeFeedback> {
    const componentDetails = components.map(c => {
      const componentType = components.find(ct => ct.id === c.typeId);
      return `${c.typeId} (${c.params.replicas || 1} replicas)`;
    }).join(', ');

    const systemPrompt = `You are an expert system architect reviewing a system design. Provide comprehensive analysis.

CHALLENGE: ${challenge.title}
DESCRIPTION: ${challenge.description}
REQUIREMENTS: ${challenge.mustHaves.join(', ')}
ANTI-PATTERNS: ${challenge.antiPatterns.join(', ')}
SLA: Latency ≤ ${challenge.sla.maxLatency}ms, Availability ≥ ${(challenge.sla.minAvailability * 100).toFixed(1)}%
BUDGET: $${challenge.budget}

CURRENT DESIGN:
- Components: ${componentDetails}
- Total Components: ${components.length}
- Connections: ${connections.length}
- Current Metrics: P95 Latency ${simulationResult.metrics.latency.p95.toFixed(1)}ms, Availability ${(simulationResult.metrics.availability * 100).toFixed(2)}%, Cost $${simulationResult.metrics.cost.toFixed(0)}
- Current Score: ${simulationResult.score}/100

ANALYSIS REQUIRED:
1. Score (0-100): Be critical but fair
2. Pros: 3-5 strengths of this design
3. Cons: 3-5 weaknesses or missing elements
4. Detailed Analysis: A comprehensive paragraph analyzing the overall architecture, design decisions, and how well it meets the challenge requirements
5. Optimal Solution: A paragraph describing what an ideal solution would look like for this challenge
6. Architecture Grade: A, B, C, D, or F
7. Cost Optimization: Specific recommendations for cost efficiency
8. Scalability Notes: How well this scales and what's needed for growth
9. Security Considerations: Security aspects and recommendations

RESPOND IN THIS EXACT JSON FORMAT:
{
  "score": 85,
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
        // Try to parse JSON response
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          // Clean the JSON string to remove control characters
          const cleanedJson = jsonMatch[0]
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
            .replace(/\n/g, '\\n') // Escape newlines
            .replace(/\r/g, '\\r') // Escape carriage returns
            .replace(/\t/g, '\\t'); // Escape tabs
          
          const parsed = JSON.parse(cleanedJson);
          console.log('🤖 Parsed Claude response:', parsed);
          return parsed;
        }
      } catch (error) {
        console.error('Failed to parse Claude response:', error);
        console.log('Raw response:', content.text);
        
        // Try to extract individual fields manually as fallback
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

    // Fallback if JSON parsing fails
    console.warn('🤖 Using fallback feedback due to parsing error');
    return this.generateBasicFeedback(analysis, challenge, simulationResult);
  }

  /**
   * Manual parsing fallback for Claude responses
   */
  private parseClaudeResponseManually(text: string): ClaudeFeedback | null {
    try {
      const extractField = (fieldName: string): string => {
        const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*(?:\\\\.[^"]*)*)"`, 'g');
        const match = regex.exec(text);
        return match ? match[1].replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t') : '';
      };

      const extractArray = (fieldName: string): string[] => {
        const regex = new RegExp(`"${fieldName}"\\s*:\\s*\\[([^\\]]+)\\]`, 'g');
        const match = regex.exec(text);
        if (!match) return [];
        
        const arrayContent = match[1];
        const items = arrayContent.split(',').map(item => 
          item.trim().replace(/^"|"$/g, '').replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t')
        );
        return items;
      };

      const scoreMatch = text.match(/"score"\s*:\s*(\d+)/);
      const gradeMatch = text.match(/"architectureGrade"\s*:\s*"([A-F])"/);

      return {
        score: scoreMatch ? parseInt(scoreMatch[1]) : 70,
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
}

export const claudeFeedbackService = new ClaudeFeedbackService();
