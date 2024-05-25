import { createEditor } from "./Editor.js";
import { editors, workspaceTabs } from "./STE.js";
import "./WorkspaceTabs.scss";

import type { Setter } from "solid-js";
import type { Editor } from "./Editor.js";

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
      {Object.values(editors).map(editor => <WorkspaceTab editor={editor!}/>)}
      <CreateEditorButton
        setCreateEditorButton={props.setCreateEditorButton}
      />
    </div>
  );
}

interface WorkspaceTabProps {
  editor: Editor;
}

function WorkspaceTab(props: WorkspaceTabProps) {
  return (
    <button
      classList={{ tab: true, active: props.editor.open }}
      data-editor-identifier={props.editor.identifier ? "" : null}
      data-editor-auto-created={props.editor.autoCreated ? "" : null}
      data-editor-refresh={props.editor.refresh ? "" : null}
      data-editor-unsaved={props.editor.unsaved ? "" : null}
      onmousedown={event => {
        if (document.activeElement === null) return;
        if (event.button !== 0 || document.activeElement.matches("[data-editor-rename]")) return;

        event.preventDefault();
        if (this.tab !== activeEditor()?.tab){
          this.open();
        }
      }}
      onkeydown={event => {
        // This is where the accidental Enter key trapping for Editor renaming is being taken over.
        // Add a check to this to only apply this key handling if the Editor isn't currently being renamed in the Editor tab.
        if (event.key === " " || event.key === "Enter"){
          event.preventDefault();
          if (this.tab !== activeEditor()?.tab){
            this.open();
          }
        }
      }}
      oncontextmenu={event => {
        if (event.target !== this.tab) return;

        let editorRename = this.tab.querySelector<HTMLInputElement>("[data-editor-rename]");
        if (editorRename === null){
          editorRename = document.createElement("input");
        } else {
          return editorRename.blur();
        }

        editorRename.type = "text";
        editorRename.placeholder = this.name;
        editorRename.tabIndex = -1;
        editorRename.value = this.name;
        editorRename.setAttribute("data-editor-rename","");
        editorRename.style.setProperty("--editor-name-width",`${this.editorName.offsetWidth}px`);

        editorRename.addEventListener("keydown",event => {
          if (editorRename === null) return;
          if (event.key === "Escape"){
            editorRename.blur();
          }
        });

        editorRename.addEventListener("input",() => {
          if (editorRename === null) return;
          editorRename.style.width = "0px";
          editorRename.offsetWidth;
          editorRename.style.setProperty("--editor-rename-width",`${editorRename.scrollWidth + 1}px`);
          editorRename.style.removeProperty("width");
        });

        editorRename.addEventListener("change",() => {
          if (editorRename === null) return;
          const { value: name } = editorRename;
          if (editorRename.value){
            this.name = name;
          }
          editorRename.blur();
        });

        editorRename.addEventListener("blur",() => {
          if (editorRename === null) return;
          editorRename.remove();
        });

        this.tab.insertBefore(editorRename,this.tab.firstChild);
        applyEditingBehavior(editorRename);

        editorRename.focus();
        editorRename.select();
      }}
      ondragover={event => {
        event.preventDefault();
        event.stopPropagation();

        if (event.dataTransfer !== null){
          event.dataTransfer.dropEffect = "copy";
        }
        if (this.tab !== activeEditor()?.tab){
          this.open();
        }
      }}>
      <span data-editor-name={props.editor.name}>{props.editor.name}</span>
     {<button
        class="option"
        tabindex={-1}
        onmousedown={event => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onclick={async event => {
          event.stopPropagation();
          await this.close();
        }}>
        <svg>
          <use href="#close_icon"/>
        </svg>
      </button>}
    </button>
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
      <svg>
        <use href="#close_icon"/>
      </svg>
    </button>
  );
}