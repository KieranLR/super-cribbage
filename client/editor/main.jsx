import React from 'react';
import { createRoot } from 'react-dom/client';
import '../editor.css';
import LayoutLabApp from './LayoutLabApp';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<LayoutLabApp />);
