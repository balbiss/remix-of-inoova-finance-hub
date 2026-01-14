import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Registro do Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW Registered!', reg))
            .catch(err => console.log('SW Registration failed: ', err));
    });
}

createRoot(document.getElementById("root")!).render(<App />);
