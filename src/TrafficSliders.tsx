import React from 'react';
import { TrafficProfile } from './componentsSchema';

interface TrafficSlidersProps {
  trafficProfile: TrafficProfile;
  onTrafficChange: (traffic: TrafficProfile) => void;
}

const TrafficSliders: React.FC<TrafficSlidersProps> = ({ 
  trafficProfile, 
  onTrafficChange 
}) => {
  const handleChange = (key: keyof TrafficProfile, value: number) => {
    onTrafficChange({
      ...trafficProfile,
      [key]: value
    });
  };

  return (
    <div style={{ padding: '15px', height: '100%', overflowY: 'auto' }}>
      <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '16px' }}>
        🎛️ What-If Analysis
      </h3>
      <p style={{ 
        fontSize: '12px', 
        color: '#666', 
        marginBottom: '15px',
        lineHeight: '1.4'
      }}>
        Adjust traffic parameters to see how your system performs under different loads
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* RPS Slider */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '5px', 
            fontSize: '12px', 
            color: '#333',
            fontWeight: 'bold'
          }}>
            Requests Per Second (RPS)
          </label>
          <input
            type="range"
            min="1000"
            max="100000"
            step="1000"
            value={trafficProfile.rps}
            onChange={(e) => handleChange('rps', parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '10px', 
            color: '#666',
            marginTop: '2px'
          }}>
            <span>1K</span>
            <span style={{ fontWeight: 'bold', color: '#333' }}>
              {trafficProfile.rps.toLocaleString()} RPS
            </span>
            <span>100K</span>
          </div>
        </div>

        {/* Read Ratio Slider */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '5px', 
            fontSize: '12px', 
            color: '#333',
            fontWeight: 'bold'
          }}>
            Read/Write Ratio
          </label>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.1"
            value={trafficProfile.readRatio}
            onChange={(e) => handleChange('readRatio', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '10px', 
            color: '#666',
            marginTop: '2px'
          }}>
            <span>10% Read</span>
            <span style={{ fontWeight: 'bold', color: '#333' }}>
              {(trafficProfile.readRatio * 100).toFixed(0)}% Read
            </span>
            <span>90% Read</span>
          </div>
        </div>

        {/* Payload Size Slider */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '5px', 
            fontSize: '12px', 
            color: '#333',
            fontWeight: 'bold'
          }}>
            Payload Size
          </label>
          <input
            type="range"
            min="100"
            max="10485760"
            step="100"
            value={trafficProfile.payloadSize}
            onChange={(e) => handleChange('payloadSize', parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '10px', 
            color: '#666',
            marginTop: '2px'
          }}>
            <span>100B</span>
            <span style={{ fontWeight: 'bold', color: '#333' }}>
              {formatBytes(trafficProfile.payloadSize)}
            </span>
            <span>10MB</span>
          </div>
        </div>

        {/* Peak Multiplier Slider */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '5px', 
            fontSize: '12px', 
            color: '#333',
            fontWeight: 'bold'
          }}>
            Peak Traffic Multiplier
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={trafficProfile.peakMultiplier}
            onChange={(e) => handleChange('peakMultiplier', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '10px', 
            color: '#666',
            marginTop: '2px'
          }}>
            <span>1x</span>
            <span style={{ fontWeight: 'bold', color: '#333' }}>
              {trafficProfile.peakMultiplier}x Peak
            </span>
            <span>10x</span>
          </div>
        </div>
      </div>

      {/* Traffic Summary */}
      <div style={{ 
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#e3f2fd',
        borderRadius: '6px',
        border: '1px solid #2196f3'
      }}>
        <h6 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '11px' }}>
          📊 Traffic Summary
        </h6>
        <div style={{ fontSize: '10px', color: '#666' }}>
          <div>Base Load: {trafficProfile.rps.toLocaleString()} RPS</div>
          <div>Peak Load: {(trafficProfile.rps * trafficProfile.peakMultiplier).toLocaleString()} RPS</div>
          <div>Reads: {(trafficProfile.rps * trafficProfile.readRatio).toLocaleString()} RPS</div>
          <div>Writes: {(trafficProfile.rps * (1 - trafficProfile.readRatio)).toLocaleString()} RPS</div>
          <div>Data Rate: {formatBytes(trafficProfile.rps * trafficProfile.payloadSize)}/s</div>
        </div>
      </div>
    </div>
  );
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default TrafficSliders;
