import { createEffect, onMount } from "solid-js";
import { editorRef, editorRefresh, editorUnsaved, editorValue, setEditorRef, setEditorRefresh, setEditorUnsaved, setEditorValue } from "../app.js";
import { applyEditingBehavior } from "../dom.js";
import { refreshPreview } from "./Workspace.js";
import NumText, { replaceEditorViewValue } from "../NumText.js";
import "./Editor.scss";

import type { EditorView } from "@codemirror/view";

export function Editor() {
  let ref: HTMLDivElement;
  let view: EditorView;

  onMount(() => {
    setEditorRef(view!);
    applyEditingBehavior(ref!);
  });

  createEffect(() => {
    const editor: EditorView | null = editorRef();
    if (!editor) return;
    // editor.value = editorValue();
    replaceEditorViewValue(editor, editorValue());
  });

  return (
    <NumText
      class="Editor"
      ref={ref!}
      view={rview => view = rview!}
      value={editorValue}
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