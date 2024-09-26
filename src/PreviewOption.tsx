import { setPreviewSource } from "./Workspace.js";

import type { Accessor } from "solid-js";

export interface PreviewOptionProps {
  identifier: string;
  getName: Accessor<string>;
}

export default function PreviewOption(props: PreviewOptionProps) {
  return (
    <li
      part="option"
      class="option"
      data-editor-identifier={props.identifier}
      tabindex={-1}
      onclick={() => {
        setPreviewSource(props.identifier);
      }}>
      {props.getName()}
    </li>
  );
}