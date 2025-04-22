import { createSignal } from "solid-js";
import Widget from "./Widget.js";
import CardItem from "./CardItem.js";
import CardOptions from "./CardOptions.js";
import { activeEditor, activeWidget, minimizeWidget, setActiveWidget, setMinimizeWidget } from "./app.js";
import { applyEditingBehavior } from "./dom.js";

export default function ReplaceTextCard() {
  const [findValue, setFindValue] = createSignal<string>("");
  const [replaceValue, setReplaceValue] = createSignal<string>("");

  function replace(): void {
    const editor = activeEditor();
    if (!editor) return;
    const replaced = editor.getValue().split(findValue()).join(replaceValue());
    if (replaced != editor.getValue()) editor.setValue(replaced);
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
      heading="Replace Text"
      main={
        <CardItem list expand>
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
        </CardItem>
      }
      options={
        <CardOptions>
          <button onclick={() => replace()}>Replace</button>
          <button onclick={() => flip()}>Flip</button>
          <button onclick={() => clear()}>Clear</button>
        </CardOptions>
      }
      getActiveWidget={activeWidget}
      setActiveWidget={setActiveWidget}
      getMinimizeWidget={minimizeWidget}
      setMinimizeWidget={setMinimizeWidget}
    />
  );
}