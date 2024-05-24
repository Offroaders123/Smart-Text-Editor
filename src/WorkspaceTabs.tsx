import Editor from "./Editor.js";
import { workspaceTabs } from "./STE.js";

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
        if (identifier === null) return;

        event.preventDefault();

        if (event.key === "ArrowLeft"){
          Editor.query(identifier)?.getPrevious()?.tab.focus();
        }
        if (event.key === "ArrowRight"){
          Editor.query(identifier)?.getNext()?.tab.focus();
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
        new Editor({ autoReplace: false });
      }}>
      <svg>
        <use href="#close_icon"/>
      </svg>
    </button>
  );
}