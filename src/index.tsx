/* @refresh reload */
import { render } from "solid-js/web";
import App from "./app.js";
import { setHeader, setViewMenu, setPreviewMenu, setWorkspace, setWorkspaceTabs, setCreateEditorButton, setWorkspaceEditors, setScaler, setPreview, previewBase, setPreviewBase } from "./STE.js";
import "./index.scss";

const root: HTMLDivElement = document.querySelector("#root")!;

render(() => (
  <App
    setHeader={setHeader}
    setViewMenu={setViewMenu}
    setPreviewMenu={setPreviewMenu}
    setWorkspace={setWorkspace}
    setWorkspaceTabs={setWorkspaceTabs}
    setCreateEditorButton={setCreateEditorButton}
    setWorkspaceEditors={setWorkspaceEditors}
    setScaler={setScaler}
    setPreview={setPreview}
    previewBase={previewBase}
    setPreviewBase={setPreviewBase}
  />
), root);