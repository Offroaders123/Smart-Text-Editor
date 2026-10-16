import { onCleanup, onMount } from "solid-js";
import { type Accelerator } from "./accelerator.ts";
import { toAccelerator } from "./keyboard.ts";
import "./MenuItem.css";

export function MenuItem(props: {
  accelerator: Accelerator;
  children: string;
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
    <li class="MenuItem">{props.children} <code class="shortcut">{props.accelerator}</code></li>
  );
}
