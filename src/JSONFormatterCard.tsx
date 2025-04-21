import { createSignal } from "solid-js";
import Widget from "./Widget.js";
import CardItem from "./CardItem.js";
import CardOptions from "./CardOptions.js";
import { activeWidget, minimizeWidget } from "./app.js";
import { applyEditingBehavior } from "./dom.js";

export default function JSONFormatterCard() {
  const [value, setValue] = createSignal<string>("");

  function format(spacing: string | number = "  "): void {
    try {
      const formatted = JSON.stringify(JSON.parse(value()),null,spacing);
      if (formatted != value()) setValue(formatted);
    } catch (error: any){
      /* ~~Make~~ Made matching for "position" optional, as Safari doesn't give JSON parsing error data, it only says that an error occurred. */
      try {
        const message = error.toString().match(/^(.+?)position /)[0];
        const errorIndex = error.toString().match(/position (\d+)/)[1];

        let errorLine: number;
        const errorLineIndex: number = (() => {
          const lineIndexes = indexi("\n",value());
          errorLine = value().substring(0,errorIndex).split("\n").length - 1;
          return lineIndexes[errorLine - 1] || 1;
        })();
        const errorPosition = errorIndex - errorLineIndex + 1;

        alert(`Could not parse JSON, a syntax error occurred.\n${message}line ${errorLine + 1} position ${errorPosition}`);
      } catch {
        alert("Could not parse JSON, a syntax error occurred.");
      }
    }
  }

  function collapse(): void {
    format("");
  }

  function clear(): void {
    setValue("");
  }

  return (
    <Widget
      id="json_formatter_card"
      heading="JSON Formatter"
      main={
        <CardItem expand>
          <num-text
            ref={ref => {
              applyEditingBehavior(ref);
              ref.editor.onchange = () => setValue(ref.value);
            }}
            class="expand"
            syntax-language="json"
            placeholder="JSON data to format..."
            value={value()}
          />
        </CardItem>
      }
      options={
        <CardOptions>
          <button onclick={() => format()}>Format</button>
          <button onclick={() => collapse()}>Collapse</button>
          <button onclick={() => clear()}>Clear</button>
        </CardOptions>
      }
      getActiveWidget={activeWidget}
      getMinimizeWidget={minimizeWidget}
    />
  );
}

function indexi(char: string, str: string): number[] {
  const list: number[] = [];
  let i = -1;
  while ((i = str.indexOf(char,i + 1)) >= 0) list.push(i + 1);
  return list;
}