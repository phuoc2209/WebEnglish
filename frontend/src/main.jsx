import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { useCheckAuth } from './hooks/useCheckAuth';
import './index.css';

// Component để tích hợp useCheckAuth
function Root() {
  useCheckAuth(); // Kiểm tra trạng thái xác thực khi ứng dụng khởi động
  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </React.StrictMode>
);