import { onCleanup, onMount } from "solid-js";

export function MenuItem(props: {
  accelerator: string,
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
