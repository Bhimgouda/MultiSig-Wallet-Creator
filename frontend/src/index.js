import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {MoralisProvider} from "react-moralis"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MoralisProvider initializeOnMount={false}>
      <App />
    </MoralisProvider>
  </React.StrictMode>
);
