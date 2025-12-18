import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initFacebookPixel } from "./lib/fbPixel";

// Initialize Facebook Pixel
initFacebookPixel();

createRoot(document.getElementById("root")!).render(<App />);
