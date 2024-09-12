import Widget from "./Widget.js";
import { applyEditingBehavior } from "./dom.js";

export default function ColorPickerCard() {
  return (
    <Widget
      id="color_picker_card"
      headingText="Color Picker"
      mainContent={[
        <div class="item list">
          <div id="picker_preview"></div>
          <input
            ref={ref => applyEditingBehavior(ref)}
            id="picker_input"
            type="text"
            value="#ee8800"
            maxlength="7"
            placeholder="#rrggbb"
          />
        </div>,
        <div class="item list">
          <label for="red_channel">Red</label>
          <input id="red_channel" type="range"/>
          <label for="green_channel">Green</label>
          <input id="green_channel" type="range"/>
          <label for="blue_channel">Blue</label>
          <input id="blue_channel" type="range"/>
        </div>
      ]}
      options={[
        <>
          <button onclick={() => /* copyPicker() */ {}}>Copy</button>
          <button onclick={() => /* insertPicker() */ {}}>Insert</button>
          <button onclick={() => /* deletePicker() */ {}}>Delete</button>
        </>
      ]}
    />
  );
}