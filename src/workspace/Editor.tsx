import { createEffect, onMount } from "solid-js";
import { editorRef, editorValue, setEditorRef } from "../app.js";
import { applyEditingBehavior } from "../dom.js";
import "./Editor.scss";

export function Editor() {
  let ref: NumTextElement;

  onMount(() => {
    setEditorRef(ref!);
    applyEditingBehavior(ref!);
  });

  createEffect(() => {
    const editor: NumTextElement | null = editorRef();
    if (!editor) return;
    editor.editor.value = editorValue();
  });

  return (
    <num-text
      class="Editor"
      ref={ref!}
    />
  );
}