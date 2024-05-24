import "./Preview.scss";

import type { Setter } from "solid-js";

export interface PreviewProps {
  setPreview: Setter<HTMLIFrameElement | null>;
}

export default function Preview(props: PreviewProps) {
  return (
    <iframe
      ref={props.setPreview}
      class="preview"
      src="about:blank"
    />
  );
}