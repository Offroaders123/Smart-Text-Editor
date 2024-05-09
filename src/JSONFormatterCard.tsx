import { Widget } from "./Card.js";
import { jsonFormatter } from "./Tools.js";
import { applyEditingBehavior } from "./dom.js";

export default function JSONFormatterCard() {
  return (
    <Widget
      id="json_formatter_card"
      headingText="JSON Formatter"
      mainContent={[
        <div class="item expand">
          <num-text
            ref={ref => applyEditingBehavior(ref)}
            id="formatter_input"
            class="expand"
            syntax-language="json"
            placeholder="JSON data to format..."
          />
        </div>
      ]}
      options={[
        <>
          <button onclick={() => jsonFormatter.format()}>Format</button>
          <button onclick={() => jsonFormatter.collapse()}>Collapse</button>
          <button onclick={() => jsonFormatter.clear()}>Clear</button>
        </>
      ]}
    />
  );
}