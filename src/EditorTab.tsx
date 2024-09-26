import CloseIcon from "./CloseIcon.js";
import { applyEditingBehavior } from "./dom.js";
import { open, close, query } from "./Editor.js";
import { activeEditor } from "./STE.js";

import type { Accessor, Setter } from "solid-js";

export interface EditorTabProps {
  identifier: string;
  getName: Accessor<string>;
  setName: Setter<string>;
  getAutoCreated: Accessor<boolean>;
  getRefresh: Accessor<boolean>;
  getUnsaved: Accessor<boolean>;
}

export default function EditorTab(props: EditorTabProps) {
  let editorName: HTMLSpanElement;

  return (
    <button
      class="tab"
      attr:data-editor-identifier={props.identifier}
      attr:data-editor-auto-created={props.getAutoCreated() ? "" : null}
      attr:data-editor-refresh={props.getRefresh() ? "" : null}
      attr:data-editor-unsaved={props.getUnsaved() ? "" : null}
      onmousedown={event => {
        if (document.activeElement === null) return;
        if (event.button !== 0 || document.activeElement.matches("[data-editor-rename]")) return;
  
        event.preventDefault();
        if (event.currentTarget !== query(activeEditor())?.tab){
          open(props.identifier);
        }
      }}
      onkeydown={event => {
        // This is where the accidental Enter key trapping for Editor renaming is being taken over.
        // Add a check to this to only apply this key handling if the Editor isn't currently being renamed in the Editor tab.
        if (event.key === " " || event.key === "Enter"){
          event.preventDefault();
          if (event.currentTarget !== query(activeEditor())?.tab){
            open(props.identifier);
          }
        }
      }}
      oncontextmenu={event => {
        if (event.target !== event.currentTarget) return;
  
        let editorRename = event.currentTarget.querySelector<HTMLInputElement>("[data-editor-rename]");
        if (editorRename === null){
          editorRename = document.createElement("input");
        } else {
          return editorRename.blur();
        }
  
        editorRename.type = "text";
        editorRename.placeholder = props.getName();
        editorRename.tabIndex = -1;
        editorRename.value = props.getName();
        editorRename.setAttribute("data-editor-rename","");
        editorRename.style.setProperty("--editor-name-width",`${editorName.offsetWidth}px`);
  
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
            props.setName(name);
          }
          editorRename.blur();
        });
  
        editorRename.addEventListener("blur",() => {
          if (editorRename === null) return;
          editorRename.remove();
        });
  
        event.currentTarget.insertBefore(editorRename,event.currentTarget.firstChild);
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
        if (event.currentTarget !== query(activeEditor())?.tab){
          open(props.identifier);
        }
      }}>
      <span
        attr:data-editor-name={props.getName()}
        ref={editorName!}>
        {props.getName()}
      </span>
      {<button
        class="option"
        tabindex={-1}
        onmousedown={event => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onclick={async event => {
          event.stopPropagation();
          await close(props.identifier);
        }}>
        <CloseIcon/>
      </button>}
    </button>
  );
}