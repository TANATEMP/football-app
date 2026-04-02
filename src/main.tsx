import { StrictMode } from 'react'
import './index.css'
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

// ดึงค่าจาก .env
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)