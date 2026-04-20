import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { initFacebookPixel } from "./lib/fbPixel";
import { initGA } from "./lib/gtag";

// Initialize Facebook Pixel & Google Analytics
initFacebookPixel();
initGA();

createRoot(document.getElementById("root")!).render(<App />);
