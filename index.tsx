import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Suppress MediaPipe/WebGL internal logs
const originalLog = console.log;
const originalWarn = console.warn;
const originalInfo = console.info;

const suppressPatterns = [
  'gl_context_webgl.cc',
  'gl_context.cc',
  'I0000',
  'W0000',
  'Successfully created a WebGL context',
  'Successfully destroyed WebGL context',
  'OpenGL error checking is disabled'
];

const shouldSuppress = (args: any[]) => {
  const msg = args.join(' ');
  return suppressPatterns.some(pattern => msg.includes(pattern));
};

console.log = (...args: any[]) => {
  if (!shouldSuppress(args)) originalLog(...args);
};
console.warn = (...args: any[]) => {
  if (!shouldSuppress(args)) originalWarn(...args);
};
console.info = (...args: any[]) => {
  if (!shouldSuppress(args)) originalInfo(...args);
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <App />
);