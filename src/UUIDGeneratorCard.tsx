import { Widget } from "./Card.js";
import { uuidGenerator } from "./Tools.js";
import { applyEditingBehavior } from "./dom.js";

export default function UUIDGeneratorCard() {
  return (
    <Widget
      id="uuid_generator_card"
      headingText="UUID Generator"
      mainContent={[
        <div class="item expand">
          <input
            ref={ref => applyEditingBehavior(ref)}
            id="generator_output"
            type="text"
            placeholder="Result..."
            readonly
          />
        </div>
      ]}
      options={[
        <button
          onclick={() => generator_output.value = uuidGenerator.generate()}>
          Generate
        </button>
      ]}
    />
  );
}