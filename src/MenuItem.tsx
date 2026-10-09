import { onCleanup, onMount } from "solid-js";
import { Accelerator } from "./accelerator.ts";

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

  function handleKeyDown(event: KeyboardEvent): void { }

  return (
    <li accelerator={props.accelerator}>{props.children}</li>
  );
}
