import STE from "./STE.js";

import type { Card } from "./Card.js";

export const theme_color = document.querySelector<HTMLMetaElement>("#theme_color")!;
export const scrollbar_styles = document.querySelector<HTMLStyleElement>("#scrollbar_styles")!;
export const theme_styles = document.querySelector<HTMLStyleElement>("#theme_styles")!;

export const symbol_definitions = document.querySelector<SVGSVGElement>("#symbol_definitions")!;
export const arrow_icon = document.querySelector<SVGSymbolElement>("#arrow_icon")!;
export const check_icon = document.querySelector<SVGSymbolElement>("#check_icon")!;
export const back_icon = document.querySelector<SVGSymbolElement>("#back_icon")!;
export const minimize_icon = document.querySelector<SVGSymbolElement>("#minimize_icon")!;
export const close_icon = document.querySelector<SVGSymbolElement>("#close_icon")!;
export const rename_icon = document.querySelector<SVGSymbolElement>("#rename_icon")!;
export const undo_icon = document.querySelector<SVGSymbolElement>("#undo_icon")!;
export const redo_icon = document.querySelector<SVGSymbolElement>("#redo_icon")!;
export const install_icon = document.querySelector<SVGSymbolElement>("#install_icon")!;
export const refresh_icon = document.querySelector<SVGSymbolElement>("#refresh_icon")!;
export const github_icon = document.querySelector<SVGSymbolElement>("#github_icon")!;

export const header = document.querySelector<HTMLElement>("#header")!;

export const app_menubar = document.querySelector<HTMLDivElement>("#app_menubar")!;
export const file_menu = document.querySelector<MenuDropElement>("#file_menu")!;
export const view_menu = document.querySelector<MenuDropElement>("#view_menu")!;
export const preview_menu = document.querySelector<MenuDropElement>("#preview_menu")!;
export const tools_menu = document.querySelector<MenuDropElement>("#tools_menu")!;
export const settings_menu = document.querySelector<MenuDropElement>("#settings_menu")!;

export const app_omnibox = document.querySelector<HTMLDivElement>("#app_omnibox")!;
export const install_option = document.querySelector<HTMLButtonElement>("#install_option")!;

export const main = document.querySelector<HTMLElement>("#main")!;

export const workspace = document.querySelector<HTMLDivElement>("#workspace")!;
export const workspace_tabs = document.querySelector<HTMLDivElement>("#workspace_tabs")!;
export const create_editor_button = document.querySelector<HTMLButtonElement>("#create_editor_button")!;
export const workspace_editors = document.querySelector<HTMLDivElement>("#workspace_editors")!;
export const scaler = document.querySelector<HTMLDivElement>("#scaler")!;
export const preview = document.querySelector<HTMLIFrameElement>("#preview")!;

export const card_backdrop = document.querySelector<HTMLDivElement>("#card_backdrop")!;

export const settings_card = document.querySelector<Card>("#settings_card")!;
export const default_orientation_setting = document.querySelector<MenuDropElement>("#default_orientation_setting")!;
export const syntax_highlighting_setting = document.querySelector<HTMLInputElement>("#syntax_highlighting_setting")!;
export const automatic_refresh_setting = document.querySelector<HTMLInputElement>("#automatic_refresh_setting")!;
export const install_button = document.querySelector<HTMLButtonElement>("#install_button")!;
export const theme_button = document.querySelector<HTMLButtonElement>("#theme_button")!;
export const clear_site_caches_button = document.querySelector<HTMLButtonElement>("#clear_site_caches_button")!;

export const theme_card = document.querySelector<Card>("#theme_card")!;
export const theme_setting = document.querySelector<NumTextElement>("#theme_setting")!;

export const preview_base_card = document.querySelector<Card>("#preview_base_card")!;
export const preview_base_input = document.querySelector<HTMLInputElement & {
  setWidth(): void;
  setValue(value: string): void;
  reset(): void;
}>("#preview_base_input")!;

export const reset_settings_card = document.querySelector<Card>("#reset_settings_card")!;
export const cleared_cache_card = document.querySelector<Card>("#cleared_cache_card")!;

export const replace_text_card = document.querySelector<Card>("#replace_text_card")!;
export const replacer_find = document.querySelector<NumTextElement>("#replacer_find")!;
export const replacer_replace = document.querySelector<NumTextElement>("#replacer_replace")!;

export const color_picker_card = document.querySelector<Card>("#color_picker_card")!;
export const picker_preview = document.querySelector<HTMLDivElement>("#picker_preview")!;
export const picker_input = document.querySelector<HTMLInputElement>("#picker_input")!;
export const red_channel = document.querySelector<HTMLInputElement>("#red_channel")!;
export const green_channel = document.querySelector<HTMLInputElement>("#green_channel")!;
export const blue_channel = document.querySelector<HTMLInputElement>("#blue_channel")!;

export const json_formatter_card = document.querySelector<Card>("#json_formatter_card")!;
export const formatter_input = document.querySelector<NumTextElement>("#formatter_input")!;

export const uri_encoder_card = document.querySelector<Card>("#uri_encoder_card")!;
export const encoder_input = document.querySelector<NumTextElement>("#encoder_input")!;
export const encoder_type = document.querySelector<HTMLInputElement>("#encoder_type")!;

export const uuid_generator_card = document.querySelector<Card>("#uuid_generator_card")!;
export const generator_output = document.querySelector<HTMLInputElement>("#generator_output")!;

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
    if ([...event.dataTransfer.items][0].kind === "file") return;
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
  if (STE.installPrompt === null) return;
  STE.installPrompt.prompt();
  const result = await STE.installPrompt.userChoice;
  if (result.outcome !== "accepted") return;
  document.documentElement.classList.remove("install-prompt-available");
  theme_button.childNodes[0].textContent = "Customize Theme";
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

window.showInstallPrompt = showInstallPrompt;
window.clearSiteCaches = clearSiteCaches;

declare global {
  interface Window {
    showInstallPrompt: typeof showInstallPrompt;
    clearSiteCaches: typeof clearSiteCaches;
  }
}