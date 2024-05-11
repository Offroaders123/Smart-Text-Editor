import { Dialog } from "./Card.js";
import { settings } from "./STE.js";
import { refreshPreview } from "./Workspace.js";
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

preview_base_input.placeholder = document.baseURI;

preview_base_input.setWidth = () => {
  preview_base_input.style.setProperty("--input-count",preview_base_input.value.length.toString());
};

preview_base_input.setValue = value => {
  preview_base_input.value = value;
  preview_base_input.setWidth();
};

preview_base_input.reset = () => {
  preview_base_input.setValue("");
  settings.previewBase = null;
  refreshPreview({ force: true });
};

preview_base_input.style.setProperty("--placeholder-count",preview_base_input.placeholder.length.toString());

preview_base_input.addEventListener("input",() => {
  preview_base_input.setWidth();
});

preview_base_input.addEventListener("change",event => {
  if (!(event.target instanceof HTMLInputElement)) return;
  const empty = event.target.matches(":placeholder-shown");
  const valid = event.target.matches(":valid");

  if (empty || !valid){
    settings.previewBase = null;
  }
  if (!empty && valid){
    settings.previewBase = event.target.value;
  }
  if (empty || valid){
    refreshPreview({ force: true });
  }
});