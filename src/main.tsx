import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './lib/hold.ts'
import App from './App.tsx'
import './styles/global.css'
import './styles/room.css'
import './styles/cake.css'
import './styles/letters.css'
import './styles/finale.css'
import './styles/landscape.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
