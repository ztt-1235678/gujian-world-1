import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 如果你之前有 index.css 也可以取消下面这行的注释
// import './index.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)