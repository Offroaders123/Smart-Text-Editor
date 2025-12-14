/* @refresh reload */
import { render } from "solid-js/web";
import App from "./app.js";
import { setHeader, setViewMenu, setWorkspace, setWorkspaceEditors, setScaler, setPreview } from "./app.js";
import "./index.scss";

const root: HTMLDivElement = document.querySelector("#root")!;

render(() => (
  <App
    setHeader={setHeader}
    setViewMenu={setViewMenu}
    setWorkspace={setWorkspace}
    setWorkspaceEditors={setWorkspaceEditors}
    setScaler={setScaler}
    setPreview={setPreview}
  />
), root);