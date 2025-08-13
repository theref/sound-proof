import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Buffer } from 'buffer'

// Polyfill Buffer for browser environment (needed for encryption)
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer
}

console.log('🚀 SoundProof main.tsx starting...')

try {
  const rootElement = document.getElementById("root")
  if (!rootElement) {
    throw new Error('Root element not found')
  }
  console.log('✅ Root element found')
  createRoot(rootElement).render(<App />);
  console.log('✅ React app rendered')
} catch (error) {
  console.error('❌ Failed to render app:', error)
}
