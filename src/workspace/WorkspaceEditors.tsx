import { Editor } from "./Editor.js";
import { createSignal } from "solid-js";
import "./WorkspaceEditors.scss";

const [getWorkspaceEditors, setWorkspaceEditors] = createSignal<HTMLDivElement | null>(null);

export { getWorkspaceEditors };

export default function WorkspaceEditors() {
  return (
    <div
      ref={setWorkspaceEditors}
      class="workspace-editors">
      <Editor/>
    </div>
  );
}