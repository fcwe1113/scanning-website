// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  // strict mode causes each class declaration to be inited twice
  // this causes the websocket connection to the backend (which is an object)
  // to be made twice in different ports so the server cant do jack shit abt it
  // moreover while react does attempt to close the first connection it cant because
  // the connection is still connecting it cant be closed with the normal termination method
  // meaning that react no longer keep tracks of the first connection (terminated in react's eyes)
  // and the backend did not process the close message of the first connection
  // and only uses the second connection
  // source: https://github.com/facebook/create-react-app/issues/10387#issuecomment-1166470655

  // and on the backend it effectively causes a memory leak unless the server knows
  // that this connection goes nowhere

  //for now keep strict mode disabled and only switch it on for specific testing purposes

  // <StrictMode>
  <App />
  // </StrictMode>,
)
