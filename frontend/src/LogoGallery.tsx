import React from 'react';
import logoMap from './logoMap';
import Logo from './components/Logo';

const names = Object.keys(logoMap);

const LogoGallery: React.FC = () => (
  <div style={{ padding: 32, background: '#f6f2ff', minHeight: '100vh' }}>
    <h1 style={{ color: '#7a3cff', fontWeight: 700 }}>Podplay Model & Mini App Logos</h1>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginTop: 32 }}>
      {names.map((name) => (
        <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
          <Logo name={name} size={64} alt={name + ' logo'} />
          <span style={{ marginTop: 8, fontSize: 14, color: '#4b296b' }}>{name}</span>
        </div>
      ))}
    </div>
  </div>
);

export default LogoGallery;
