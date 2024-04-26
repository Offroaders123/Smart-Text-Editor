import * as STE from "./STE.js";

export interface GetElementStyleOptions {
  element: Element;
  property: string;
  pseudo?: string;
}

/**
 * Gets a style property value for a given element.
*/
export function getElementStyle({ element, property, pseudo }: GetElementStyleOptions): string {
  return getComputedStyle(element,pseudo).getPropertyValue(property);
}

/**
 * Applies the app's behavior defaults, like Drag and Drop handling, to `<input>` and `<num-text>` elements.
*/
export function applyEditingBehavior(element: HTMLInputElement | NumTextElement): void {
  (element as HTMLElement).addEventListener("dragover",event => {
    event.stopPropagation();
    if (event.dataTransfer === null) return;
    event.dataTransfer.dropEffect = "copy";
  });

  (element as HTMLElement).addEventListener("drop",event => {
    if (event.dataTransfer === null) return;
    if ([...event.dataTransfer.items][0]?.kind === "file") return;
    event.stopPropagation();
    for (const menu of document.querySelectorAll<MenuDropElement>("menu-drop[data-open]")){
      menu.close();
    }
  });

  if (element instanceof HTMLInputElement){
    element.spellcheck = false;
    element.autocomplete = "off";
    element.autocapitalize = "none";
    element.setAttribute("autocorrect","off");
  }

  if (element instanceof NumTextElement){
    element.colorScheme.set("dark");
    element.themes.remove("vanilla-appearance");
    const scrollbarStyles = document.createElement("style");
    scrollbarStyles.textContent = scrollbar_styles.textContent;
    element.shadowRoot.insertBefore(scrollbarStyles,element.container);
  }
}

export type SetTitleOptions =
  | { content: string; }
  | { reset: true; }

/**
 * Sets the title of the window.
*/
export function setTitle(options: SetTitleOptions): void {
  if ("content" in options){
    document.title = `Smart Text Editor - ${options.content}`;
  } else {
    document.title = "Smart Text Editor";
  }
}

/**
 * Shows the PWA Install Prompt, if the `BeforeInstallPrompt` event was fired when the app first started.
*/
export async function showInstallPrompt(): Promise<void> {
  if (STE.installPrompt() === null) return;
  STE.installPrompt()!.prompt();
  const result = await STE.installPrompt()!.userChoice;
  if (result.outcome !== "accepted") return;
  document.documentElement.classList.remove("install-prompt-available");
  theme_button.childNodes[0]!.textContent = "Customize Theme";
}

/**
 * Clears the Service Worker cache, if the user confirms doing so.
*/
export function clearSiteCaches(): void {
  const hasConfirmed = confirm("Are you sure you would like to clear all app caches?\nSmart Text Editor will no longer work offline until an Internet connection is available.");
  if (hasConfirmed){
    navigator.serviceWorker.controller?.postMessage({ action: "clear-site-caches" });
  }
}