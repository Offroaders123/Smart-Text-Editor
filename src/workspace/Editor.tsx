import { createEffect, onMount } from "solid-js";
import { editorRef, editorValue, setEditorRef } from "../app.js";
import { applyEditingBehavior } from "../dom.js";
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
    />
  );
}