import { createEffect } from "solid-js";
import { editorRef, editorValue } from "../app.jsx";
import "./Editor.scss";

export function Editor() {
  createEffect(() => {
    const editor: NumTextElement | null = editorRef();
    if (!editor) return;
    editor.editor.value = editorValue();
  });

  return (
    <num-text
      class="Editor"
      ref={editorRef}
    />
  );
}