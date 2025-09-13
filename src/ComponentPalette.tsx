import React from 'react';
import { ComponentType } from './componentsSchema';
import { theme } from './styles/theme';

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

  const categoryColors = theme.colors.components;

  return (
    <div style={{ 
      padding: theme.spacing.lg, 
      height: '100%', 
      overflowY: 'auto',
      backgroundColor: theme.colors.gray[50]
    }}>
      <p style={{ 
        fontSize: theme.typography.fontSize.sm, 
        color: theme.colors.gray[600], 
        marginBottom: theme.spacing.lg,
        lineHeight: 1.5
      }}>
        Drag components to the canvas to build your system design
      </p>
      
      {Object.entries(groupedComponents).map(([category, categoryComponents]) => (
        <div key={category} style={{ marginBottom: theme.spacing.lg }}>
          <h4 style={{ 
            marginBottom: theme.spacing.sm, 
            color: theme.colors.gray[900],
            textTransform: 'capitalize',
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.semibold,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: categoryColors[category as keyof typeof categoryColors] || theme.colors.gray[500],
              borderRadius: '50%'
            }} />
            {category}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
            {categoryComponents.map((component) => (
              <div
                key={component.id}
                draggable
                onDragStart={(event) => onDragStart(event, component.id)}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  background: `linear-gradient(135deg, ${categoryColors[component.category as keyof typeof categoryColors] || theme.colors.gray[500]} 0%, ${categoryColors[component.category as keyof typeof categoryColors] || theme.colors.gray[500]}dd 100%)`,
                  color: theme.colors.white,
                  borderRadius: theme.borderRadius.lg,
                  cursor: 'grab',
                  border: 'none',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  boxShadow: theme.shadows.sm,
                  transition: theme.transitions.fast,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = theme.shadows.lg;
                  e.currentTarget.style.cursor = 'grabbing';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = theme.shadows.sm;
                  e.currentTarget.style.cursor = 'grab';
                }}
                title={component.description}
              >
                <span>{component.name}</span>
                <span style={{
                  fontSize: theme.typography.fontSize.xs,
                  opacity: 0.8
                }}>
                  →
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComponentPalette;
