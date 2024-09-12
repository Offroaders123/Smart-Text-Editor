import { createSignal } from "solid-js";
import Widget from "./Widget.js";
import { query } from "./Editor.js";
import { activeEditor } from "./STE.js";
import { applyEditingBehavior } from "./dom.js";

export default function ReplaceTextCard() {
  const [findValue, setFindValue] = createSignal<string>("");
  const [replaceValue, setReplaceValue] = createSignal<string>("");

  function replace(): void {
    const editor = query(activeEditor());
    if (!editor) return;
    const replaced = editor.state.value.split(findValue()).join(replaceValue());
    if (replaced != editor.state.value) editor.state.value = replaced;
  }

  function flip(): void {
    const find = findValue();
    const replace = replaceValue();
    setFindValue(replace);
    setReplaceValue(find);
  }

  function clear(): void {
    setFindValue("");
    setReplaceValue("");
  }

  return (
    <Widget
      id="replace_text_card"
      headingText="Replace Text"
      mainContent={[
        <div class="item list expand">
          <num-text
            ref={ref => applyEditingBehavior(ref)}
            placeholder="Text to find..."
            value={findValue()}
            oninput={event => setFindValue(event.currentTarget.value)}
          />
          <num-text
            ref={ref => applyEditingBehavior(ref)}
            placeholder="Replace with..."
            value={replaceValue()}
            oninput={event => setReplaceValue(event.currentTarget.value)}
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