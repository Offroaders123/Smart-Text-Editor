import type { JSX } from "solid-js";

export default function DecorativeImage(props: JSX.HTMLElementTags["img"]) {
  props.draggable ??= false;

  return (
    <img {...props}/>
  );
}