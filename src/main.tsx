import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { initGA } from "./lib/gtag";
import { captureAttribution, initMetaPixel } from "./lib/metaTracking";

// Capture marketing attribution, then initialize Meta Pixel & Google Analytics
captureAttribution();
initMetaPixel();
initGA();

createRoot(document.getElementById("root")!).render(<App />);
