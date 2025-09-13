import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node, 
  Edge, 
  addEdge, 
  Connection, 
  useNodesState, 
  useEdgesState,
  ReactFlowProvider,
  ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';
import { sampleChallenges } from './sampleChallenges';
import { simulate, SimulationResult } from './simulate';
import { components, PlacedComponent, Connection as SystemConnection, TrafficProfile } from './componentsSchema';
import ChallengePanel from './ChallengePanel';
import ComponentPalette from './ComponentPalette';
import MetricsPanel from './MetricsPanel';
import ComponentConfigPanel from './ComponentConfigPanel';
import TrafficSliders from './TrafficSliders';
import ChaosEvents, { ChaosEvent } from './ChaosEvents';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedChallenge, setSelectedChallenge] = useState(sampleChallenges[0]);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [currentTraffic, setCurrentTraffic] = useState<TrafficProfile>(selectedChallenge.trafficProfile);
  const [activeChaosEvents, setActiveChaosEvents] = useState<ChaosEvent[]>([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const onConnect = useCallback((params: Connection) => {
    // Validate connection
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);
    
    if (!sourceNode || !targetNode) return;
    
    const sourceComponent = sourceNode.data.componentType;
    const targetComponent = targetNode.data.componentType;
    
    if (!sourceComponent || !targetComponent) return;
    
    // Check if connection is allowed
    const isAllowed = sourceComponent.allowedConnections?.includes(targetComponent.id) || false;
    
    const newEdge = {
      ...params,
      id: `${params.source}-${params.target}`,
      style: {
        stroke: isAllowed ? '#27ae60' : '#e74c3c',
        strokeWidth: 2
      },
      animated: isAllowed,
      label: isAllowed ? '' : '❌ Invalid'
    };
    
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges, nodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');

    if (typeof type === 'undefined' || !type || !reactFlowBounds) {
      return;
    }

    const position = reactFlowInstance?.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    if (!position) return;

    const componentType = components.find(c => c.id === type);
    if (!componentType) return;

    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type: 'default',
      position,
      data: { 
        label: componentType.name,
        componentType: componentType,
        params: { ...componentType.defaultParams }
      },
      style: {
        background: getCategoryColor(componentType.category),
        color: 'white',
        border: '2px solid #333',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    };

    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, setNodes]);

  const getCategoryColor = (category: string) => {
    const colors = {
      edge: '#ff6b6b',
      app: '#4ecdc4',
      storage: '#45b7d1',
      integration: '#96ceb4',
      search: '#feca57',
      cdn: '#ff9ff3'
    };
    return colors[category as keyof typeof colors] || '#95a5a6';
  };

  const runSimulation = useCallback((traffic?: TrafficProfile) => {
    if (nodes.length === 0) return;
    
    setIsSimulating(true);
    
    // Convert React Flow nodes/edges to our system format
    const placedComponents: PlacedComponent[] = nodes.map(node => ({
      id: node.id,
      typeId: node.data.componentType?.id || '',
      params: node.data.params || {},
      position: node.position
    }));

    const systemConnections: SystemConnection[] = edges.map(edge => ({
      id: edge.id || `${edge.source}-${edge.target}`,
      fromId: edge.source,
      toId: edge.target,
      protocol: 'http',
      capacity: 1000
    }));

    // Create a modified challenge with the current traffic profile
    const challengeWithTraffic = {
      ...selectedChallenge,
      trafficProfile: traffic || currentTraffic
    };

    // Run simulation
    const result = simulate(challengeWithTraffic, {
      components: placedComponents,
      connections: systemConnections,
      activeChaosEvents
    });

    setSimulationResult(result);
    setIsSimulating(false);
  }, [nodes, edges, selectedChallenge, currentTraffic, activeChaosEvents]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onUpdateNode = useCallback((nodeId: string, params: any) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, params } }
          : node
      )
    );
  }, [setNodes]);

  const onTrafficChange = useCallback((traffic: TrafficProfile) => {
    setCurrentTraffic(traffic);
    // Auto-run simulation when traffic changes
    if (nodes.length > 0) {
      runSimulation(traffic);
    }
  }, [nodes.length, runSimulation]);

  const onChallengeSelect = useCallback((challenge: any) => {
    setSelectedChallenge(challenge);
    setCurrentTraffic(challenge.trafficProfile);
    setSimulationResult(null); // Clear previous results
    setActiveChaosEvents([]); // Clear chaos events
  }, []);

  const onChaosEventTrigger = useCallback((event: ChaosEvent) => {
    setActiveChaosEvents(prev => [...prev, event]);
    // Auto-run simulation when chaos event is triggered
    if (nodes.length > 0) {
      setTimeout(() => runSimulation(), 100);
    }
  }, [nodes.length, runSimulation]);

  const onChaosEventStop = useCallback((eventId: string) => {
    setActiveChaosEvents(prev => prev.filter(e => e.id !== eventId));
    // Auto-run simulation when chaos event is stopped
    if (nodes.length > 0) {
      setTimeout(() => runSimulation(), 100);
    }
  }, [nodes.length, runSimulation]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: '10px 20px', 
        backgroundColor: '#2c3e50', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>🏗️ System Design Simulator</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={runSimulation}
            disabled={isSimulating || nodes.length === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: isSimulating ? '#95a5a6' : '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isSimulating ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {isSimulating ? '🔄 Simulating...' : '▶️ Simulate'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Left Panel - Challenges */}
        <div style={{ 
          width: '300px', 
          backgroundColor: '#ecf0f1', 
          borderRight: '2px solid #bdc3c7',
          overflow: 'hidden'
        }}>
          <ChallengePanel
            challenges={sampleChallenges}
            selectedChallenge={selectedChallenge}
            onChallengeSelect={onChallengeSelect}
          />
        </div>

        {/* Center - Canvas */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                fitView
              >
                <Background />
                <Controls />
              </ReactFlow>
            </ReactFlowProvider>
          </div>
        </div>

        {/* Right Panel - Components, Config, Traffic, Chaos & Metrics */}
        <div style={{ 
          width: '500px', 
          backgroundColor: '#ecf0f1', 
          borderLeft: '2px solid #bdc3c7',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Component Palette */}
          <div style={{ 
            height: '20%', 
            borderBottom: '2px solid #bdc3c7',
            overflow: 'hidden'
          }}>
            <ComponentPalette components={components} />
          </div>
          
          {/* Component Configuration */}
          <div style={{ 
            height: '20%',
            borderBottom: '2px solid #bdc3c7',
            overflow: 'hidden'
          }}>
            <ComponentConfigPanel 
              selectedNode={selectedNode}
              onUpdateNode={onUpdateNode}
            />
          </div>

          {/* Traffic Sliders */}
          <div style={{ 
            height: '20%',
            borderBottom: '2px solid #bdc3c7',
            overflow: 'hidden'
          }}>
            <TrafficSliders 
              trafficProfile={currentTraffic}
              onTrafficChange={onTrafficChange}
            />
          </div>

          {/* Chaos Events */}
          <div style={{ 
            height: '20%',
            borderBottom: '2px solid #bdc3c7',
            overflow: 'hidden'
          }}>
            <ChaosEvents 
              onEventTrigger={onChaosEventTrigger}
              activeEvents={activeChaosEvents}
              onEventStop={onChaosEventStop}
            />
          </div>
          
          {/* Metrics Panel */}
          <div style={{ 
            height: '20%',
            overflow: 'hidden'
          }}>
            <MetricsPanel 
              simulationResult={simulationResult}
              selectedChallenge={selectedChallenge}
              isSimulating={isSimulating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
