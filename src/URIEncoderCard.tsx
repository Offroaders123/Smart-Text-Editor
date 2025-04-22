import Widget from "./Widget.js";
import CardItem from "./CardItem.js";
import CardOptions from "./CardOptions.js";
import Checkbox from "./Checkbox.js";
import { activeWidget, minimizeWidget, setActiveWidget, setMinimizeWidget } from "./app.js";
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
      heading="URI Encoder"
      main={
        <CardItem expand>
          <num-text
            ref={ref => applyEditingBehavior(ref)}
            id="encoder_input"
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
      getActiveWidget={activeWidget}
      setActiveWidget={setActiveWidget}
      getMinimizeWidget={minimizeWidget}
      setMinimizeWidget={setMinimizeWidget}
    />
  );
}