import React, { useState } from 'react';

export interface ChaosEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  effects: {
    latencyMultiplier?: number;
    availabilityReduction?: number;
    costMultiplier?: number;
    affectedComponents?: string[];
  };
}

const chaosEvents: ChaosEvent[] = [
  {
    id: 'az-down',
    name: 'Availability Zone Down',
    description: 'An entire availability zone becomes unavailable',
    icon: '🌩️',
    severity: 'high',
    effects: {
      availabilityReduction: 0.3,
      latencyMultiplier: 1.5,
      affectedComponents: ['web', 'db', 'cache']
    }
  },
  {
    id: 'cache-miss-storm',
    name: 'Cache Miss Storm',
    description: 'Cache hit rate drops to 10% due to key expiration',
    icon: '❄️',
    severity: 'medium',
    effects: {
      latencyMultiplier: 2.0,
      costMultiplier: 1.2,
      affectedComponents: ['cache', 'db']
    }
  },
  {
    id: 'database-failover',
    name: 'Database Failover',
    description: 'Primary database fails, triggering failover',
    icon: '🔄',
    severity: 'high',
    effects: {
      latencyMultiplier: 3.0,
      availabilityReduction: 0.1,
      affectedComponents: ['db']
    }
  },
  {
    id: 'network-partition',
    name: 'Network Partition',
    description: 'Network connectivity issues between regions',
    icon: '🔌',
    severity: 'critical',
    effects: {
      latencyMultiplier: 5.0,
      availabilityReduction: 0.5,
      affectedComponents: ['api', 'web', 'db']
    }
  },
  {
    id: 'thundering-herd',
    name: 'Thundering Herd',
    description: 'Massive spike in requests overwhelms system',
    icon: '🐄',
    severity: 'high',
    effects: {
      latencyMultiplier: 4.0,
      availabilityReduction: 0.2,
      affectedComponents: ['api', 'web', 'lb']
    }
  },
  {
    id: 'disk-full',
    name: 'Disk Space Exhausted',
    description: 'Storage systems run out of disk space',
    icon: '💾',
    severity: 'critical',
    effects: {
      availabilityReduction: 0.8,
      affectedComponents: ['db', 'object']
    }
  },
  {
    id: 'memory-leak',
    name: 'Memory Leak',
    description: 'Application memory usage grows continuously',
    icon: '🧠',
    severity: 'medium',
    effects: {
      latencyMultiplier: 1.8,
      costMultiplier: 1.5,
      affectedComponents: ['web', 'api']
    }
  },
  {
    id: 'dns-outage',
    name: 'DNS Outage',
    description: 'DNS resolution fails for external services',
    icon: '🌐',
    severity: 'high',
    effects: {
      latencyMultiplier: 2.5,
      availabilityReduction: 0.3,
      affectedComponents: ['api', 'web']
    }
  }
];

interface ChaosEventsProps {
  onEventTrigger: (event: ChaosEvent) => void;
  activeEvents: ChaosEvent[];
  onEventStop: (eventId: string) => void;
}

const ChaosEvents: React.FC<ChaosEventsProps> = ({ 
  onEventTrigger, 
  activeEvents, 
  onEventStop 
}) => {
  const [selectedEvent, setSelectedEvent] = useState<ChaosEvent | null>(null);

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545'
    };
    return colors[severity as keyof typeof colors] || '#6c757d';
  };

  const isEventActive = (eventId: string) => {
    return activeEvents.some(e => e.id === eventId);
  };

  return (
    <div style={{ padding: '15px', height: '100%', overflowY: 'auto' }}>
      <h3 style={{ marginBottom: '15px', color: '#e2e8f0', fontSize: '16px' }}>
        Chaos Engineering
      </h3>
      <p style={{ 
        fontSize: '12px', 
        color: '#cbd5e1', 
        marginBottom: '15px',
        lineHeight: '1.4'
      }}>
        Test your system's resilience by injecting realistic failure scenarios
      </p>

      {/* Active Events */}
      {activeEvents.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#e2e8f0', fontSize: '12px' }}>
            Active Events
          </h4>
          {activeEvents.map((event) => (
            <div key={event.id} style={{
              padding: '6px 8px',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              marginBottom: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              color: '#e2e8f0'
            }}>
              <span>{event.name}</span>
              <button
                onClick={() => onEventStop(event.id)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                Stop
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Event Library */}
      <div>
        <h4 style={{ margin: '0 0 10px 0', color: '#e2e8f0', fontSize: '12px' }}>
          Available Events
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {chaosEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              style={{
                padding: '10px',
                backgroundColor: isEventActive(event.id) ? '#052e16' : '#0f172a',
                border: isEventActive(event.id) ? '1px solid #16a34a' : '1px solid #334155',
                borderRadius: '8px',
                cursor: isEventActive(event.id) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                fontSize: '11px',
                opacity: isEventActive(event.id) ? 0.7 : 1,
                color: '#e2e8f0'
              }}
              onMouseEnter={(e) => {
                if (!isEventActive(event.id)) {
                  e.currentTarget.style.backgroundColor = '#111827';
                }
              }}
              onMouseLeave={(e) => {
                if (!isEventActive(event.id)) {
                  e.currentTarget.style.backgroundColor = '#0f172a';
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                <div style={{ fontWeight: 'bold', color: '#e2e8f0', fontSize: '10px' }}>
                  {event.name}
                </div>
                <span style={{ 
                  padding: '1px 4px', 
                  backgroundColor: getSeverityColor(event.severity),
                  color: 'white',
                  borderRadius: '3px',
                  fontSize: '9px',
                  fontWeight: 'bold'
                }}>
                  {event.severity.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '3px' }}>
                {event.description}
              </div>
              {!isEventActive(event.id) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventTrigger(event);
                  }}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  Trigger
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#0f172a',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '80%',
            overflowY: 'auto',
            border: '1px solid #334155',
            color: '#e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#e2e8f0' }}>
                {selectedEvent.name}
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#334155',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ marginBottom: '15px', color: '#94a3b8', fontSize: '14px' }}>
              {selectedEvent.description}
            </p>

            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#e2e8f0', fontSize: '14px' }}>Effects:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#cbd5e1' }}>
                {selectedEvent.effects.latencyMultiplier && (
                  <li>Latency increases by {(selectedEvent.effects.latencyMultiplier - 1) * 100}%</li>
                )}
                {selectedEvent.effects.availabilityReduction && (
                  <li>Availability drops by {(selectedEvent.effects.availabilityReduction * 100).toFixed(0)}%</li>
                )}
                {selectedEvent.effects.costMultiplier && (
                  <li>Cost increases by {(selectedEvent.effects.costMultiplier - 1) * 100}%</li>
                )}
                {selectedEvent.effects.affectedComponents && (
                  <li>Affects: {selectedEvent.effects.affectedComponents.join(', ')}</li>
                )}
              </ul>
            </div>

            {!isEventActive(selectedEvent.id) && (
              <button
                onClick={() => {
                  onEventTrigger(selectedEvent);
                  setSelectedEvent(null);
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Trigger Chaos Event
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChaosEvents;
