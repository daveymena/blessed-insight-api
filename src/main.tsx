import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("Bible App v1.1.0 Loaded - Production Build");
createRoot(document.getElementById('root')!).render(<App />);
