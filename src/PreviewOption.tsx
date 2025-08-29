import { setPreviewSource } from "./workspace/Workspace.js";

export interface PreviewOptionProps {
  editor: Editor;
}

export default function PreviewOption(props: PreviewOptionProps) {
  return (
    <li
      part="option"
      class="option"
      data-editor-identifier={props.editor.identifier}
      tabindex={-1}
      onclick={() => {
        setPreviewSource(props.editor);
      }}>
      {props.editor.getName()}
    </li>
  );
}