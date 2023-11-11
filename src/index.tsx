import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";

import "./index.scss";

const root = createRoot(document.querySelector<HTMLDivElement>("#root")!);

root.render(
  <StrictMode>
    <App/>
  </StrictMode>
);