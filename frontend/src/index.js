import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { SecretjsContextProvider } from "./components/SecretjsContext";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <SecretjsContextProvider>
  <App />
  </SecretjsContextProvider>
  // </React.StrictMode>
  
);
