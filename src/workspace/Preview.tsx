import { createSignal } from "solid-js";
import "./Preview.scss";

const [getPreview, setPreview] = createSignal<HTMLIFrameElement | null>(null);

export { getPreview };

export default function Preview() {
  return (
    <iframe
      ref={setPreview}
      class="preview"
      src="about:blank"
    />
  );
}