import { createSignal, Show } from "solid-js";
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
  let editorRename: HTMLInputElement;
  const [getRenaming, setRenaming] = createSignal<boolean>(false);

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
  
        const isRenaming: boolean = getRenaming();
        if (!isRenaming){
          setRenaming(true);
        } else {
          return editorRename.blur();
        }
  
        // event.currentTarget.insertBefore(editorRename,event.currentTarget.firstChild);
        // applyEditingBehavior(editorRename);
  
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
      <Show when={getRenaming()}>
        <input
          type="text"
          placeholder={props.getName()}
          tabindex={-1}
          value={props.getName()}
          data-editor-rename
          style={{
            "--editor-name-width": `${editorName!.offsetWidth}px`
          }}
          onkeydown={event => {
            if (event.key === "Escape"){
              event.currentTarget.blur();
            }
          }}
          oninput={event => {
            event.currentTarget.style.width = "0px";
            event.currentTarget.offsetWidth;
            event.currentTarget.style.setProperty("--editor-rename-width",`${event.currentTarget.scrollWidth + 1}px`);
            event.currentTarget.style.removeProperty("width");
          }}
          onchange={event => {
            const { value: name } = event.currentTarget;
            if (event.currentTarget.value){
              props.setName(name);
            }
            event.currentTarget.blur();
          }}
          onblur={_event => {
            // event.currentTarget.remove();
            setRenaming(false);
          }}
          ref={ref => { editorRename = ref; applyEditingBehavior(ref); }}
        />
      </Show>
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