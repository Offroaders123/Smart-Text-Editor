import { onCleanup, onMount } from "solid-js";
import { Accelerator } from "./accelerator.ts";
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
    try {
      const accelerator: Accelerator = toAccelerator(event);
      if (accelerator !== props.accelerator) return;
      event.preventDefault();
      console.log(accelerator);
    } catch { }
  }

  return (
    <li accelerator={props.accelerator}>{props.children}</li>
  );
}
