import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import SessionExpiryHandler from "./components/SessionExpiryHandler.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <SessionExpiryHandler />
        <App />
      </BrowserRouter>      
    </AuthProvider>
  </StrictMode>,
);
