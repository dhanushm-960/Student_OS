  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { GoogleOAuthProvider } from "@react-oauth/google";

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your_google_client_id_here";

  createRoot(document.getElementById("root")!).render(
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  );