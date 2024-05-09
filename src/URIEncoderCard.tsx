import { Widget } from "./Card.js";
import Checkbox from "./Checkbox.js";
import { uriEncoder } from "./Tools.js";
import { applyEditingBehavior } from "./dom.js";

export default function URIEncoderCard() {
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
          <button onclick={() => uriEncoder.encode()}>Encode</button>
          <button onclick={() => uriEncoder.decode()}>Decode</button>
          <button onclick={() => uriEncoder.clear()}>Clear</button>
        </>,
        <Checkbox id="encoder_type">Enable URI Component</Checkbox>
      ]}
    />
  );
}