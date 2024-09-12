import { createEffect, createMemo } from "solid-js";
import Dialog from "./Dialog.js";
import { settings } from "./STE.js";
import { refreshPreview } from "./Workspace.js";
import { applyEditingBehavior } from "./dom.js";

import type { Accessor, Setter } from "solid-js";

export interface PreviewBaseCardProps {
  value: Accessor<string | null>;
  setValue: Setter<string | null>;
}

export default function PreviewBaseCard(props: PreviewBaseCardProps) {
  const inputWidth = createMemo<number>(() => props.value()?.length ?? 0);
  const inputPlaceholder = document.baseURI;

  createEffect(() => {
    if (props.value() === null) {
      settings.previewBase = null;
      refreshPreview({ force: true });
    }
  });

  return (
    <Dialog
      id="preview_base_card"
      headingText="Base URL"
      mainContent={[
        <div class="item list expand">
          <input
            ref={ref => applyEditingBehavior(ref)}
            type="url"
            placeholder={inputPlaceholder}
            style={{
              "--input-count": inputWidth(),
              "--placeholder-count": inputPlaceholder.length
            }}
            value={props.value() ?? ""}
            oninput={event => props.setValue(event.currentTarget.value)}
            onchange={event => {
              const empty = event.currentTarget.matches(":placeholder-shown");
              const valid = event.currentTarget.matches(":valid");

              if (empty || !valid){
                settings.previewBase = null;
              }
              if (!empty && valid){
                settings.previewBase = event.currentTarget.value;
              }
              if (empty || valid){
                refreshPreview({ force: true });
              }
            }}
          />
        </div>
      ]}
      options={[
        <button
          onclick={() => props.setValue(null)}>
          Reset
        </button>
      ]}
    />
  );
}