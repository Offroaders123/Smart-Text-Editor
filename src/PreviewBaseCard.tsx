import { Dialog } from "./Card.js";
import { applyEditingBehavior } from "./dom.js";

export default function PreviewBaseCard() {
  return (
    <Dialog
      id="preview_base_card"
      headingText="Base URL"
      mainContent={[
        <div class="item list expand">
          <input
            ref={ref => applyEditingBehavior(ref)}
            id="preview_base_input"
            type="url"
          />
        </div>
      ]}
      options={[
        <button
          onclick={() => preview_base_input.reset()}>
          Reset
        </button>
      ]}
    />
  );
}