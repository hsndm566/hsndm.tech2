import { createRoot } from "react-dom/client";
import App from "./App";
import { installErrorTelemetry } from "./lib/errorTelemetry";
import "./index.css";

installErrorTelemetry();
createRoot(document.getElementById("root")!).render(<App />);
