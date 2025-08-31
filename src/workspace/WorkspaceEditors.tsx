import { Editor } from "./Editor.js";
import "./WorkspaceEditors.scss";

import type { Setter } from "solid-js";

export interface WorkspaceEditorsProps {
  setWorkspaceEditors: Setter<HTMLDivElement | null>;
}

export default function WorkspaceEditors(props: WorkspaceEditorsProps) {
  return (
    <div
      ref={props.setWorkspaceEditors}
      class="workspace-editors">
      <Editor/>
    </div>
  );
}