/* @refresh reload */
import { render } from "solid-js/web";
import App from "./app.js";
import { setHeader, setViewMenu, setPreviewMenu, setWorkspace, setWorkspaceEditors, setScaler, setPreview, previewBase, setPreviewBase } from "./app.js";
import "./index.scss";

const root: HTMLDivElement = document.querySelector("#root")!;

render(() => (
  <App
    setHeader={setHeader}
    setViewMenu={setViewMenu}
    setPreviewMenu={setPreviewMenu}
    setWorkspace={setWorkspace}
    setWorkspaceEditors={setWorkspaceEditors}
    setScaler={setScaler}
    setPreview={setPreview}
    previewBase={previewBase}
    setPreviewBase={setPreviewBase}
  />
), root);