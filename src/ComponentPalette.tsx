import React from 'react';
import { ComponentType } from './componentsSchema';

interface ComponentPaletteProps {
  components: ComponentType[];
}

const ComponentPalette: React.FC<ComponentPaletteProps> = ({ components }) => {
  const onDragStart = (event: React.DragEvent, componentType: string) => {
    event.dataTransfer.setData('application/reactflow', componentType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const groupedComponents = components.reduce((acc, component) => {
    if (!acc[component.category]) {
      acc[component.category] = [];
    }
    acc[component.category].push(component);
    return acc;
  }, {} as Record<string, ComponentType[]>);

  const categoryColors = {
    edge: '#ff6b6b',
    app: '#4ecdc4',
    storage: '#45b7d1',
    integration: '#96ceb4',
    search: '#feca57',
    cdn: '#ff9ff3'
  };

  return (
    <div style={{ padding: '15px', height: '100%', overflowY: 'auto' }}>
      <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '16px' }}>Components</h3>
      <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
        Drag components to the canvas to build your system design
      </p>
      
      {Object.entries(groupedComponents).map(([category, categoryComponents]) => (
        <div key={category} style={{ marginBottom: '15px' }}>
          <h4 style={{ 
            marginBottom: '8px', 
            color: '#333',
            textTransform: 'capitalize',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {category}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {categoryComponents.map((component) => (
              <div
                key={component.id}
                draggable
                onDragStart={(event) => onDragStart(event, component.id)}
                style={{
                  padding: '8px 10px',
                  backgroundColor: categoryColors[component.category as keyof typeof categoryColors] || '#95a5a6',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'grab',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '500',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                title={component.description}
              >
                {component.name}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComponentPalette;
