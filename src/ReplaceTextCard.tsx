import { Widget } from "./Card.js";
import { activeEditor } from "./STE.js";
import { applyEditingBehavior } from "./dom.js";

export default function ReplaceTextCard() {
  function replace(): void {
    const editor = activeEditor();
    if (!editor) return;
    const replaced = editor.value.split(replacer_find.value).join(replacer_replace.value);
    if (replaced != editor.value) editor.value = replaced;
  }

  function flip(): void {
    [replacer_find.value,replacer_replace.value] = [replacer_replace.value,replacer_find.value];
  }

  function clear(): void {
    [replacer_find.value,replacer_replace.value] = ["",""];
  }

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
          <button onclick={() => replace()}>Replace</button>
          <button onclick={() => flip()}>Flip</button>
          <button onclick={() => clear()}>Clear</button>
        </>
      ]}
    />
  );
}