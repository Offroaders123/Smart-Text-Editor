import { createEffect, on, onMount } from "solid-js";
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

  createEffect(on(editorValue, () => {
    //// @ts-expect-error - for reactivity;
    // this value should be passed to refreshPreview once that is stateless;
    // only am realizing now how that makes a lot more sense than being
    // hooked to state itself. Dependency injection!
    // Gotta give this codebase more love than I remember to. It's come a
    // long way, and I am learning more and more about why it was and wasn't
    // working. Learning is great.
    // const value = editorValue();
    if (!editorRefresh()){
      setEditorRefresh(true);
    }
    if (!editorUnsaved()){
      setEditorUnsaved(true);
    }
    refreshPreview();
  }));

  return (
    <NumText
      class="Editor"
      ref={ref!}
      view={rview => view = rview!}
      value={editorValue}
      setValue={setEditorValue}
    />
  );
}