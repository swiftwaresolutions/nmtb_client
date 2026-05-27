import React from 'react';

const DicomViewer: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%', margin: 0, padding: 0, overflowY: 'auto' }}>
      <iframe
        src="http://localhost:3000/"
        style={{ width: '100%', height: '100vh', border: 'none' }}
      />
    </div>
  );
};

export default DicomViewer;
