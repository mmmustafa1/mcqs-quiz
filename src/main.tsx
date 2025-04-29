import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './mobile.css'
import './registerSW'

createRoot(document.getElementById("root")!).render(<App />);
