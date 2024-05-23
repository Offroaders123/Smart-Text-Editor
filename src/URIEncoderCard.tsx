import { Widget } from "./Card.js";
import Checkbox from "./Checkbox.js";
import { applyEditingBehavior } from "./dom.js";

export default function URIEncoderCard() {
  function encode(): void {
    const encodingType = (!encoder_type.checked) ? encodeURI : encodeURIComponent;
    encoder_input.value = encodingType(encoder_input.value);
  }

  function decode(): void {
    const decodingType = (!encoder_type.checked) ? decodeURI : decodeURIComponent;
    encoder_input.value = decodingType(encoder_input.value);
  }

  function clear(): void {
    encoder_input.value = "";
  }

  return (
    <Widget
      id="uri_encoder_card"
      headingText="URI Encoder"
      mainContent={[
        <div class="item expand">
          <num-text
            ref={ref => applyEditingBehavior(ref)}
            id="encoder_input"
            class="expand"
            placeholder="Text to encode..."
          />
        </div>
      ]}
      options={[
        <>
          <button onclick={() => encode()}>Encode</button>
          <button onclick={() => decode()}>Decode</button>
          <button onclick={() => clear()}>Clear</button>
        </>,
        <Checkbox id="encoder_type">Enable URI Component</Checkbox>
      ]}
    />
  );
}