import { activeDialog, dialogPrevious, setDialogPrevious, setActiveDialog, setActiveWidget, activeEditor, activeWidget, activeAlert, setActiveAlert } from "./STE.js";
import Editor from "./Editor.js";
import { getElementStyle } from "./dom.js";
import DecorativeImage from "./DecorativeImage.js";
import { Show, createSignal } from "solid-js";

import type { JSX } from "solid-js";

export type CardType = "alert" | "widget" | "dialog";

export interface CardComponentProps {
  id: string;
  type: CardType;
  cardParent?: string;
  headerIcon?: string;
  headerText: string;
  content: JSX.Element;
  options?: JSX.Element[];
}

/**
 * The base component for the Alert, Dialog, and Widget card types.
*/
export default function Card(props: CardComponentProps) {
  let thiss: HTMLDivElement;
  let minimizeElem: HTMLButtonElement;

  const [minimized, setMinimized] = createSignal<boolean>(false);
  const [minimizedChange, setMinimizedChange] = createSignal<string | null>(null);
  const [active, setActive] = createSignal<boolean>(false);
  // const active = createMemo<boolean>(() => {
  //   switch (props.type) {
  //     case "alert": return activeAlert() === props.id;
  //     case "dialog": return activeDialog() === props.id;
  //     case "widget": return activeWidget() === props.id;
  //   }
  // });
  const [alertTimeout, setAlertTimeout] = createSignal<string | null>(null);

  return (
    <div
      id={props.id}
      ref={thiss!}
      classList={{ "ste-card": true, minimize: minimized(), "minimize-change": minimizedChange() !== null, active: active(), "alert-timeout": alertTimeout() !== null }}
      data-type={props.type}
      onkeydown={event => {
        if (props.type !== "dialog" || event.key != "Tab") return;
        const navigable = getNavigableElements({ container: event.currentTarget, scope: true });
        if (!event.shiftKey){
          if (document.activeElement != navigable[navigable.length - 1]) return;
          event.preventDefault();
          navigable[0]?.focus();
        } else if (document.activeElement == navigable[0]){
          event.preventDefault();
          navigable[navigable.length - 1]?.focus();
        }
      }}
    >
      <div class="header" data-card-parent={props.cardParent}>
        <button
          class="card-back"
          onclick={() => {
            const card = document.querySelector<HTMLDivElement>(`#${props.cardParent}`)!;
            const type: CardType = card.getAttribute("data-type")! as CardType;

            switch (type) {
              // Alert doesn't have a case here because it wouldn't make sense
              // case "alert":
              case "alert": return setActiveAlert(card.id as ReturnType<typeof setActiveAlert>);
              case "dialog": return setActiveDialog(card.id as ReturnType<typeof setActiveDialog>);
              case "widget": return setActiveWidget(card.id as ReturnType<typeof setActiveWidget>);
            }
          }}>
          <svg>
            <use href="#back_icon"/>
          </svg>
        </button>
        <div class="card-controls">
          <button
            class="control"
            ref={minimizeElem!}
            data-control="minimize"
            onkeydown={event => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              if (event.repeat) return;
              event.currentTarget.click();
            }}
            onclick={() => minimize()}
          >
            <svg>
              <use href="#minimize_icon"/>
            </svg>
          </button>
          <button
            class="control"
            data-control="close"
            onclick={() => close()}
          >
            <svg>
              <use href="#close_icon"/>
            </svg>
          </button>
        </div>
        <Show when={typeof props.headerIcon === "string"}>
          <DecorativeImage class="icon" src={props.headerIcon} alt=""/>
        </Show>
        <span class="heading">{props.headerText}</span>
      </div>
      <div class="main">
        <div class="content">
          {props.content}
        </div>
        {props.options?.map(row => <div class="options">{row}</div>)}
      </div>
    </div>
  );

  function open(previous?: Card): void {
    if (active() && alertTimeout() !== null) return close();
    if (props.type != "alert"){
      document.querySelectorAll<Card>(`.ste-card.active`).forEach(card => {
        if (card.type != "dialog" && card.type != props.type) return;
        card.close();
        if (!card.matches(".minimize")) return;
        const transitionDuration = parseInt(`${Number(getElementStyle({ element: card, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
        window.setTimeout(() => card.minimize(),transitionDuration);
      });
    }
    setActive(true);
    if (props.type == "widget" && card_backdrop.matches(".active")) card_backdrop.classList.remove("active");
    if (props.type == "alert"){
      const timeoutIdentifier = Math.random().toString();
      setAlertTimeout(timeoutIdentifier);
      window.setTimeout(() => {
        if (alertTimeout() != timeoutIdentifier) return;
        setAlertTimeout(null);
        this.close();
      },4000);
    }
    if (props.type == "dialog"){
      document.body.addEventListener("keydown",catchCardNavigation);
      card_backdrop.classList.add("active");
      if (!activeDialog() && !dialogPrevious()){
        setDialogPrevious(document.activeElement as HTMLElement);
      }
      document.querySelectorAll<MenuDropElement>("menu-drop[data-open]").forEach(menu => menu.close());
      const transitionDuration = parseInt(`${Number(getElementStyle({ element: thiss, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 500}`);
      window.setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        if (previous) thiss.querySelector<HTMLElement>(`[data-card-previous="${previous.id}"]`)!.focus();
      },transitionDuration);
      setActiveDialog(props.id as ReturnType<typeof setActiveDialog>);
    }
    if (props.type == "widget") setActiveWidget(props.id as ReturnType<typeof setActiveWidget>);
  }

  function minimize(): void {
    const icon = minimizeElem.querySelector<SVGUseElement>("svg use")!;
    const main = thiss.querySelector<HTMLDivElement>(".main")!;
    const changeIdentifier = Math.random().toString();

    setMinimizedChange(changeIdentifier);
    workspace_tabs.setAttribute("data-minimize-change",changeIdentifier);
    const transitionDuration = parseInt(`${Number(getElementStyle({ element: thiss, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
    if (!minimized()){
      setMinimized(true);
      thiss.style.setProperty("--card-minimize-width",`${minimizeElem.querySelector("svg")!.clientWidth + parseInt(getElementStyle({ element: minimizeElem, property: "--control-padding" }),10) * 2}px`);
      thiss.style.setProperty("--card-main-width",`${main.clientWidth}px`);
      thiss.style.setProperty("--card-main-height",`${main.clientHeight}px`);
      icon.setAttribute("href","#arrow_icon");
      window.setTimeout(() => {
        workspace_tabs.style.setProperty("--minimize-tab-width",getElementStyle({ element: thiss, property: "width" }));
        Editor.setTabsVisibility();
      },transitionDuration);
      if (thiss.contains(document.activeElement) && document.activeElement != minimizeElem) minimizeElem.focus();
    } else {
      setMinimized(false);
      window.setTimeout(() => {
        if (minimizedChange() == changeIdentifier) thiss.style.removeProperty("--card-minimize-width");
      },transitionDuration);
      thiss.style.removeProperty("--card-main-width");
      thiss.style.removeProperty("--card-main-height");
      icon.setAttribute("href","#minimize_icon");
      workspace_tabs.style.removeProperty("--minimize-tab-width");
    }
    window.setTimeout(() => {
      if (minimizedChange() == changeIdentifier) setMinimizedChange(null);;
      if (workspace_tabs.getAttribute("data-minimize-change") == changeIdentifier) workspace_tabs.removeAttribute("data-minimize-change");
    },transitionDuration);
  }

  function close(): void {
    setActive(false);
    if (minimized()){
      const transitionDuration = parseInt(`${Number(getElementStyle({ element: thiss, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
      window.setTimeout(() => minimize(),transitionDuration);
    }
    if (props.type == "dialog"){
      document.body.removeEventListener("keydown",catchCardNavigation);
      card_backdrop.classList.remove("active");
      setActiveDialog(null);
      if (dialogPrevious()){
        const prev: HTMLElement = dialogPrevious()!;
        const hidden = (getElementStyle({ element: prev, property: "visibility" }) == "hidden");
        (!workspace_editors.contains(prev) && !hidden) ? prev.focus({ preventScroll: true }) : activeEditor()?.focus({ preventScroll: true });
        setDialogPrevious(null);
      }
    }
    if (props.type == "widget") setActiveWidget(null);
  }
}

  /**
   * Gets all navigable elements within a given parent element.
   * 
   * @param options If the scope option is set to `true`, only direct children within the parent element will be selected.
  */
  function getNavigableElements({ container, scope = false }: GetNavigableElementsOptions): HTMLElement[] {
    scope = (scope) ? "" : ":scope > ";
    const navigable: NodeListOf<HTMLElement> = container.querySelectorAll(`${scope}button:not([disabled]), ${scope}textarea:not([disabled]), ${scope}input:not([disabled]), ${scope}select:not([disabled]), ${scope}a[href]:not([disabled]), ${scope}[tabindex]:not([tabindex="-1"])`);
    return Array.from(navigable).filter(element => (getElementStyle({ element, property: "display" }) != "none"));
  }

  function catchCardNavigation(event: KeyboardEvent): void {
    if (!activeDialog() || event.key != "Tab" || document.activeElement != document.body) return;
    const activeDialogg = document.querySelector<HTMLDivElement>(`#${activeDialog()!}`)!;
    const navigable = getNavigableElements({ container: activeDialogg, scope: true });
    event.preventDefault();
    navigable[((!event.shiftKey) ? 0 : navigable.length - 1)]?.focus();
  }

export interface GetNavigableElementsOptions {
  container: HTMLElement;
  scope?: boolean | string;
}