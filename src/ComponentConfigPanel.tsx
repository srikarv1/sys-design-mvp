import React from 'react';
import { Node } from 'reactflow';
import { ComponentType, ComponentParams } from './componentsSchema';

interface ComponentConfigPanelProps {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, params: ComponentParams) => void;
}

const ComponentConfigPanel: React.FC<ComponentConfigPanelProps> = ({ 
  selectedNode, 
  onUpdateNode 
}) => {
  if (!selectedNode || !selectedNode.data.componentType) {
    return (
      <div style={{ 
        padding: '15px', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#666',
        fontSize: '12px'
      }}>
        Select a component to configure
      </div>
    );
  }

  const componentType: ComponentType = selectedNode.data.componentType;
  const currentParams: ComponentParams = selectedNode.data.params || {};

  const handleParamChange = (key: string, value: any) => {
    const newParams = { ...currentParams, [key]: value };
    onUpdateNode(selectedNode.id, newParams);
  };

  const renderParamInput = (key: string, value: any) => {
    if (key === 'replicas' || key === 'readReplicas' || key === 'partitions' || key === 'ttl') {
      return (
        <input
          type="number"
          min="1"
          max="100"
          value={value || 1}
          onChange={(e) => handleParamChange(key, parseInt(e.target.value) || 1)}
          style={{
            width: '100%',
            padding: '4px 8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        />
      );
    }

    if (key === 'size') {
      return (
        <select
          value={value || 'medium'}
          onChange={(e) => handleParamChange(key, e.target.value)}
          style={{
            width: '100%',
            padding: '4px 8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      );
    }

    if (key === 'region') {
      return (
        <select
          value={value || 'single'}
          onChange={(e) => handleParamChange(key, e.target.value)}
          style={{
            width: '100%',
            padding: '4px 8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        >
          <option value="single">Single Region</option>
          <option value="multi">Multi Region</option>
        </select>
      );
    }

    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => handleParamChange(key, e.target.value)}
        style={{
          width: '100%',
          padding: '4px 8px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '12px'
        }}
      />
    );
  };

  return (
    <div style={{ padding: '15px', height: '100%', overflowY: 'auto' }}>
      <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '16px' }}>
        ⚙️ Configure Component
      </h3>
      
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '14px' }}>
          {componentType.name}
        </h4>
        <p style={{ 
          margin: 0, 
          fontSize: '12px', 
          color: '#666',
          lineHeight: '1.4'
        }}>
          {componentType.description}
        </p>
      </div>

      <div>
        <h5 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '12px' }}>
          Configuration
        </h5>
        
        {Object.entries(componentType.defaultParams).map(([key, defaultValue]) => (
          <div key={key} style={{ marginBottom: '12px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '4px', 
              fontSize: '11px', 
              color: '#666',
              textTransform: 'capitalize',
              fontWeight: 'bold'
            }}>
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            {renderParamInput(key, currentParams[key] ?? defaultValue)}
          </div>
        ))}
      </div>

      {/* Performance Preview */}
      <div style={{ 
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        border: '1px solid #dee2e6'
      }}>
        <h6 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '11px' }}>
          Performance Preview
        </h6>
        <div style={{ fontSize: '10px', color: '#666' }}>
          <div>Base Latency: ~{componentType.latencyFn(currentParams, { rps: 1000, readRatio: 0.8, payloadSize: 1024, peakMultiplier: 2 }).toFixed(1)}ms</div>
          <div>Base Cost: ~${componentType.costFn(currentParams, { rps: 1000, readRatio: 0.8, payloadSize: 1024, peakMultiplier: 2 }).toFixed(0)}/mo</div>
          <div>Availability: ~{(componentType.availabilityFn(currentParams) * 100).toFixed(2)}%</div>
        </div>
      </div>
    </div>
  );
};

export default ComponentConfigPanel;
