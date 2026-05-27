import React from 'react';

const DicomWeb: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%', margin: 0, padding: 0, overflowY: 'auto' }}>
      <iframe
        src="http://localhost:8042/ui/app/#/"
        style={{ width: '100%', height: '100vh', border: 'none' }}
      />
    </div>
  );
};

export default DicomWeb;
