import React from 'react';
import { ComponentType } from './componentsSchema';
import { theme } from './styles/theme';

interface ComponentPaletteProps {
  components: ComponentType[];
  onAddComponent?: (typeId: string) => void;
}

const ComponentPalette: React.FC<ComponentPaletteProps> = ({ components, onAddComponent }) => {
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
      padding: theme.spacing.xl, 
      height: '100%', 
      overflowY: 'auto',
      background: 'transparent'
    }}>
      <p style={{ 
        fontSize: theme.typography.fontSize.base, 
        color: '#cbd5e1', 
        marginBottom: theme.spacing.xl,
        lineHeight: 1.6
      }}>
        Drag components to the canvas to build your system design
      </p>
      
      {Object.entries(groupedComponents).map(([category, categoryComponents]) => (
        <div key={category} style={{ marginBottom: theme.spacing.lg }}>
          <h4 style={{ 
            marginBottom: theme.spacing.md, 
            color: theme.colors.white,
            textTransform: 'capitalize',
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.semibold,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              backgroundColor: categoryColors[category as keyof typeof categoryColors] || theme.colors.gray[500],
              borderRadius: '50%',
              boxShadow: `0 0 8px ${categoryColors[category as keyof typeof categoryColors] || theme.colors.gray[500]}40`
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
                  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                  background: `linear-gradient(135deg, ${categoryColors[component.category as keyof typeof categoryColors] || theme.colors.gray[500]} 0%, ${categoryColors[component.category as keyof typeof categoryColors] || theme.colors.gray[500]}dd 100%)`,
                  color: theme.colors.white,
                  borderRadius: theme.borderRadius.xl,
                  cursor: 'grab',
                  border: 'none',
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.medium,
                  boxShadow: `0 4px 12px ${categoryColors[component.category as keyof typeof categoryColors] || theme.colors.gray[500]}30`,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${categoryColors[component.category as keyof typeof categoryColors] || theme.colors.gray[500]}50`;
                  e.currentTarget.style.cursor = 'grabbing';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${categoryColors[component.category as keyof typeof categoryColors] || theme.colors.gray[500]}30`;
                  e.currentTarget.style.cursor = 'grab';
                }}
                onClick={() => onAddComponent && onAddComponent(component.id)}
                title={component.description}
              >
                <span>{component.name}</span>
                <span style={{
                  fontSize: theme.typography.fontSize.xs,
                  opacity: 0.8
                }}>
                  +
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
