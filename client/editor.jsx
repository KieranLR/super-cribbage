import React from 'react';
import { createRoot } from 'react-dom/client';
import './editor.css';

const Editor = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-600">phaser editor</h1>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Editor />);
