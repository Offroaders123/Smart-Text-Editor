import Widget from "./Widget.js";
import CardItem from "./CardItem.js";
import CardOptions from "./CardOptions.js";
import Checkbox from "../Checkbox.js";
import { applyEditingBehavior } from "../dom.js";
import NumText, { replaceEditorViewValue } from "../NumText.js";

import type { EditorView } from "@codemirror/view";

export default function URIEncoderCard() {
  let encoder_input: EditorView;

  function encode(): void {
    const encodingType = (!encoder_type.checked) ? encodeURI : encodeURIComponent;
    // encoder_input.value = encodingType(encoder_input.value);
    replaceEditorViewValue(encoder_input, encodingType(encoder_input.state.doc.toString()));
  }

  function decode(): void {
    const decodingType = (!encoder_type.checked) ? decodeURI : decodeURIComponent;
    // encoder_input.value = decodingType(encoder_input.value);
    replaceEditorViewValue(encoder_input, decodingType(encoder_input.state.doc.toString()));
  }

  function clear(): void {
    // encoder_input.value = "";
    replaceEditorViewValue(encoder_input, "");
  }

  return (
    <Widget
      id="uri_encoder_card"
      heading="URI Encoder"
      main={
        <CardItem expand>
          <NumText
            ref={ref => {
              applyEditingBehavior(ref);
            }}
            view={ref => {
              encoder_input = ref;
            }}
            class="expand"
            placeholder="Text to encode..."
          />
        </CardItem>
      }
      options={
        <>
        <CardOptions>
          <button onclick={() => encode()}>Encode</button>
          <button onclick={() => decode()}>Decode</button>
          <button onclick={() => clear()}>Clear</button>
        </CardOptions>
        <CardOptions>
        <Checkbox id="encoder_type">Enable URI Component</Checkbox>
        </CardOptions>
        </>
      }
    />
  );
}