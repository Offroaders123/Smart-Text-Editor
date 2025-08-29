import CloseIcon from "../icon/CloseIcon.js";
import { workspaceTabs } from "../app.js";
import "./WorkspaceTabs.scss";

import type { Setter } from "solid-js";

export interface WorkspaceTabsProps {
  setWorkspaceTabs: Setter<HTMLDivElement | null>;
  setCreateEditorButton: Setter<HTMLButtonElement | null>;
}

export default function WorkspaceTabs(props: WorkspaceTabsProps) {
  return (
    <div
      ref={props.setWorkspaceTabs}
      class="workspace-tabs"
      onkeydown={event => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        if (!workspaceTabs()!.contains(document.activeElement) || !(document.activeElement instanceof HTMLElement)) return;

        const identifier = document.activeElement.getAttribute("data-editor-identifier");
        const editor = query(identifier);
        if (editor === null) return;

        event.preventDefault();

        if (event.key === "ArrowLeft"){
          getPrevious(editor)?.tab.focus();
        }
        if (event.key === "ArrowRight"){
          getNext(editor)?.tab.focus();
        }
      }}>
      <CreateEditorButton
        setCreateEditorButton={props.setCreateEditorButton}
      />
    </div>
  );
}

interface CreateEditorButtonProps {
  setCreateEditorButton: Setter<HTMLButtonElement | null>;
}

function CreateEditorButton(props: CreateEditorButtonProps) {
  return (
    <button
      ref={props.setCreateEditorButton}
      class="create-editor-button"
      title="New Editor"
      onkeydown={event => {
        if (event.key !== "Enter") return;
        if (event.repeat){
          event.preventDefault();
        }
      }}
      onmousedown={event => {
        event.preventDefault();
      }}
      onclick={() => {
        createEditor({ autoReplace: false });
      }}>
      <CloseIcon/>
    </button>
  );
}