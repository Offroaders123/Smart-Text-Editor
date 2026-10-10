import { onCleanup, onMount } from "solid-js";
import { type Accelerator } from "./accelerator.ts";
import { toAccelerator } from "./keyboard.ts";

export function MenuItem(props: {
  accelerator: Accelerator,
  children: string,
}) {
  onMount(() => {
    const controller = new AbortController();

    document.addEventListener("keydown", handleKeyDown, {
      signal: controller.signal
    });

    onCleanup(() => controller.abort());
  });

  function handleKeyDown(event: KeyboardEvent): void {
    const accelerator: Accelerator = toAccelerator(event);
    if (accelerator !== props.accelerator) return;
    event.preventDefault();
    console.log(accelerator);
  }

  return (
    <li>{props.children} <code>{props.accelerator}</code></li>
  );
}
