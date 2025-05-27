import { activeDialog } from "./app.js";
import { getElementStyle } from "./dom.js";

export interface GetNavigableElementsOptions {
  container: HTMLElement;
  scope?: boolean | string;
}

/**
 * Gets all navigable elements within a given parent element.
 * 
 * @param options If the scope option is set to `true`, only direct children within the parent element will be selected.
*/
export function getNavigableElements({ container, scope = false }: GetNavigableElementsOptions): HTMLElement[] {
  scope = (scope) ? "" : ":scope > ";
  const navigable: NodeListOf<HTMLElement> = container.querySelectorAll(`${scope}button:not([disabled]), ${scope}textarea:not([disabled]), ${scope}input:not([disabled]), ${scope}select:not([disabled]), ${scope}a[href]:not([disabled]), ${scope}[tabindex]:not([tabindex="-1"])`);
  return Array.from(navigable).filter(element => (getElementStyle({ element, property: "display" }) != "none"));
}

export function catchCardNavigation(event: KeyboardEvent): void {
  if (!activeDialog() || event.key != "Tab" || document.activeElement != document.body) return;
  const navigable = getNavigableElements({ container: document.getElementById(activeDialog()!)!, scope: true });
  event.preventDefault();
  navigable[((!event.shiftKey) ? 0 : navigable.length - 1)]?.focus();
}