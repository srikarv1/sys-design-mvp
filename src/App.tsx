import React from 'react';
import ReactFlow, { Background, Controls } from 'react-flow-renderer';
import { sampleChallenges } from './sampleChallenges';
import { simulate } from './simulate';

export default function App() {
  const elements = [
    { id: '1', data: { label: 'API Gateway' }, position: { x: 50, y: 50 }, type: 'input' },
    { id: '2', data: { label: 'Web Server' }, position: { x: 200, y: 50 } },
    { id: 'e1-2', source: '1', target: '2', animated: true }
  ];

  const result = simulate(sampleChallenges[0]);

  return (
    <div style={{ height: '100vh' }}>
      <h2 style={{textAlign:'center'}}>System Design Simulator</h2>
      <ReactFlow elements={elements}>
        <Background />
        <Controls />
      </ReactFlow>
      <div style={{padding:20}}>
        <h3>Sample Simulation Result</h3>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
    </div>
  );
}
