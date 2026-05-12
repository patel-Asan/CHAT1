
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter} from 'react-router-dom'
import { AuthProvider} from '../src/Context/AuthContext.jsx'
import { ChatProvider } from './Context/ChatContext.jsx'
import { CallProvider } from './Context/CallContext.jsx'



createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <AuthProvider>
    <ChatProvider>
      <CallProvider>
        <App />
      </CallProvider>
    </ChatProvider>
    </AuthProvider>
  </BrowserRouter>,
)
