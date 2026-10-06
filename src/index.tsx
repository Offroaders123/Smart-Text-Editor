/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App.tsx";
import "./index.css";

// Service Worker
if (window.isSecureContext && !import.meta.env.DEV) {
  navigator.serviceWorker.register("./service-worker.js", { type: "module" });
}

const root: HTMLDivElement = document.querySelector("#root")!;

render(() => <App />, root);
