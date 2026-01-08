import { createEffect, onMount } from "solid-js";
import { editorRef, editorRefresh, editorUnsaved, editorValue, setEditorRef, setEditorRefresh, setEditorUnsaved, setEditorValue } from "../app.js";
import { applyEditingBehavior } from "../dom.js";
import { refreshPreview } from "./Workspace.js";
import "./Editor.scss";

export function Editor() {
  let ref: HTMLTextAreaElement;

  onMount(() => {
    setEditorRef(ref!);
    applyEditingBehavior(ref!);
  });

  createEffect(() => {
    const editor: HTMLTextAreaElement | null = editorRef();
    if (!editor) return;
    editor.value = editorValue();
  });

  return (
    <textarea
      class="NumText Editor"
      ref={ref!}
      value={editorValue()}
      oninput={event => {
        setEditorValue(event.currentTarget.value);
        if (!editorRefresh()){
          setEditorRefresh(true);
        }
        if (!editorUnsaved()){
          setEditorUnsaved(true);
        }
        refreshPreview();
      }}
    />
  );
}