import { Widget } from "./Card.js";
import { applyEditingBehavior } from "./dom.js";

export default function UUIDGeneratorCard() {
  return (
    <Widget
      id="uuid_generator_card"
      headingText="UUID Generator"
      mainContent={[
        <div class="item expand">
          <input
            ref={ref => applyEditingBehavior(ref)}
            id="generator_output"
            type="text"
            placeholder="Result..."
            readonly
          />
        </div>
      ]}
      options={[
        <button
          onclick={() => generator_output.value = generate()}>
          Generate
        </button>
      ]}
    />
  );
}

export const generate: () => string = (() => {
  const lut: string[] = [];
  for (let i = 0; i < 256; i++) lut[i] = ((i < 16) ? "0" : "") + i.toString(16);
  return () => {
    const d0 = (Math.random() * 0xffffffff) | 0, d1 = (Math.random() * 0xffffffff) | 0, d2 = (Math.random() * 0xffffffff) | 0, d3 = (Math.random() * 0xffffffff) | 0;
    return `${lut[d0 & 0xff]}${lut[(d0 >> 8) & 0xff]}${lut[(d0 >> 16) & 0xff]}${lut[(d0 >> 24) & 0xff]}-${lut[d1 & 0xff]}${lut[(d1 >> 8) & 0xff]}-${lut[((d1 >> 16) & 0x0f) | 0x40]}${lut[(d1 >> 24) & 0xff]}-${lut[(d2 & 0x3f) | 0x80]}${lut[(d2 >> 8) & 0xff]}-${lut[(d2 >> 16) & 0xff]}${lut[(d2 >> 24) & 0xff]}${lut[d3 & 0xff]}${lut[(d3 >> 8) & 0xff]}${lut[(d3 >> 16) & 0xff]}${lut[(d3 >> 24) & 0xff]}`;
  }
})();