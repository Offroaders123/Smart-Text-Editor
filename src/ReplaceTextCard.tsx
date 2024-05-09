import { Widget } from "./Card.js";
import { replaceText } from "./Tools.js";
import { applyEditingBehavior } from "./dom.js";

export default function ReplaceTextCard() {
  return (
    <Widget
      id="replace_text_card"
      headingText="Replace Text"
      mainContent={[
        <div class="item list expand">
          <num-text
            ref={ref => applyEditingBehavior(ref)}
            id="replacer_find"
            placeholder="Text to find..."
          />
          <num-text
            ref={ref => applyEditingBehavior(ref)}
            id="replacer_replace"
            placeholder="Replace with..."
          />
        </div>
      ]}
      options={[
        <>
          <button onclick={() => replaceText.replace()}>Replace</button>
          <button onclick={() => replaceText.flip()}>Flip</button>
          <button onclick={() => replaceText.clear()}>Clear</button>
        </>
      ]}
    />
  );
}