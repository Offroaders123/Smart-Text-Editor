import { createEffect, createSignal, Show } from "solid-js";
import { activeDialog, activeWidget, dialogPrevious, setDialogPrevious, setActiveDialog, setActiveWidget, activeEditor, workspaceEditors, workspaceTabs } from "./app.js";
import DecorativeImage from "./DecorativeImage.js";
import ArrowIcon from "./ArrowIcon.js";
import BackIcon from "./BackIcon.js";
import MinimizeIcon from "./MinimizeIcon.js";
import CloseIcon from "./CloseIcon.js";
import { setTabsVisibility } from "./Editor.js";
import { getElementStyle } from "./dom.js";
import "./Card.scss";

import type { Accessor, JSX, Setter } from "solid-js";
import type { CardID, DialogID, WidgetID } from "./app.js";

export interface CardElement extends HTMLDivElement {
  id: CardID;
}

export type CardType = "alert" | "widget" | "dialog";

export interface CardControls {
  readonly minimize: HTMLButtonElement;
  readonly close: HTMLButtonElement;
}

export interface CardProps {
  id: CardID;
  type: CardType;
  active: Accessor<boolean>;
  setActive: Setter<boolean>;
  parent?: DialogID;
  heading: string;
  icon?: string;
  main: JSX.Element;
  options?: JSX.Element;
}

/**
 * The base component for the Alert, Dialog, and Widget card types.
*/
export default function Card(props: CardProps) {
  let card: CardElement;
  let header: HTMLDivElement;
  const [minimize, setMinimize] = props.type === "widget" ? createSignal<boolean>(false) : [null, null];
  const [getAlertTimeout, setAlertTimeout] = createSignal<string | null>(null);

  createEffect(() => {
    if (!props.active()) return;
    if (props.type !== "dialog") return;

    if (activeWidget() !== null) {
      props.setActive(false);
    }
  });

  createEffect(() => {
    if (!props.active()) return;
    if (props.type !== "widget") return;

    if (minimize!()) {
      const transitionDuration = parseInt(`${Number(getElementStyle({ element: card!, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
      window.setTimeout(() => {
        setMinimize!(!minimize!());
        // if (minimize!()) return;
        // minimizeCard(props.id);
      },transitionDuration);
    }
  });

  createEffect(() => {
    if (!props.active()) return;

    switch (props.type) {
      case "alert": {
        const timeoutIdentifier = Math.random().toString();
        setAlertTimeout(timeoutIdentifier);
        window.setTimeout(() => {
          if (getAlertTimeout() != timeoutIdentifier) return;
          setAlertTimeout(null);
          props.setActive(false);
          // closeCard(props.id);
        },4000);
        break;
      };
      case "dialog": {
        document.body.addEventListener("keydown",catchCardNavigation);
        // setCardBackdropShown(true);
        if (!activeDialog() && !dialogPrevious()){
          setDialogPrevious(document.activeElement as HTMLElement);
        }
        document.querySelectorAll<MenuDropElement>("menu-drop[data-open]").forEach(menu => menu.close());
        // const transitionDuration = parseInt(`${Number(getElementStyle({ element: card!, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 500}`);
        // window.setTimeout(() => {
        //   if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        //   if (previous) card!.querySelector<HTMLElement>(`[data-card-previous="${previous}"]`)!.focus();
        // },transitionDuration);
        setActiveDialog(props.id as DialogID);
        break;
      };
      case "widget": {
        setActiveWidget(props.id as WidgetID);
        break;
      };
    }
  });

  createEffect(() => {
    const active: boolean = props.active();
    if (active) {
      openCard(props.id);
    } else {
      closeCard(props.id);
    }
  });

  if (minimize !== null) {
    createEffect(() => {
      void minimize(); // Only called because it is an accessor for the effect computation.
      minimizeCard(props.id);
    });
  }

  return (
    <div
      id={props.id}
      class="Card"
      data-type={props.type}
      data-active={props.active() ? "" : null}
      ref={card!}
      onkeydown={event => {
        if (card!.getAttribute("data-type") != "dialog" || event.key != "Tab") return;
        const navigable = getNavigableElements({ container: card!, scope: true });
        if (!event.shiftKey){
          if (document.activeElement != navigable[navigable.length - 1]) return;
          event.preventDefault();
          navigable[0]?.focus();
        } else if (document.activeElement == navigable[0]){
          event.preventDefault();
          navigable[navigable.length - 1]?.focus();
        }
      }}>
      <div class="header" data-card-parent={props.type === "dialog" ? props.parent : null} ref={header!}>
        <Show when={props.type === "alert"}>
          <DecorativeImage class="icon" src={props.icon!} alt=""/>
        </Show>
        <Show when={props.type === "dialog"}>
          <button class="card-back" onclick={() => {
            openCard(props.parent!);

            const previous: string = card!.id;
            const transitionDuration = parseInt(`${Number(getElementStyle({ element: card!, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 500}`);
            window.setTimeout(() => {
              if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
              if (previous) card!.querySelector<HTMLElement>(`[data-card-previous="${previous}"]`)!.focus();
            },transitionDuration);
                }}>
            <BackIcon/>
          </button>
        </Show>
        <span class="heading">{props.heading}</span>
        <div class="card-controls">
          <button class="control" data-control="minimize" onkeydown={event => {
            if (event.key != "Enter") return;
            event.preventDefault();
            if (event.repeat) return;
            event.currentTarget.click();
          }} onclick={() => setMinimize!(!minimize!())}>
            <MinimizeIcon/>
          </button>
          <button class="control" data-control="close" onclick={() => props.setActive(false)}>
            <CloseIcon/>
          </button>
        </div>
      </div>
      <div class="main">
        <div class="content">
          {props.main}
        </div>
        {props.options}
      </div>
    </div>
  );

  function openCard(id: CardID): void {
    const self = document.getElementById(id)! as HTMLDivElement;

    if (props.active() && !getAlertTimeout()) return void props.setActive(false);
    // if (getCardType(self) != "alert"){
    //   document.querySelectorAll<HTMLDivElement>(`.Card[data-active]`).forEach(card => {
    //     if (getCardType(card) != "dialog" && getCardType(card) != getCardType(self)) return;
    //     closeCard(card.id as CardID);
    //     if (!card.matches("[data-minimize]")) return;
    //     const transitionDuration = parseInt(`${Number(getElementStyle({ element: card, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
    //     window.setTimeout(() => minimizeCard(card.id as CardID),transitionDuration);
    //   });
    // }
    // props.setActive(true);
    // self.setAttribute("data-active","");
    // if (getCardType(self) == "widget" && cardBackdropShown()) setCardBackdropShown(false);
    if (getCardType(self) == "alert"){
      const timeoutIdentifier = Math.random().toString();
      setAlertTimeout(timeoutIdentifier);
      window.setTimeout(() => {
        if (getAlertTimeout() != timeoutIdentifier) return;
        setAlertTimeout(null);
        props.setActive(false);
        // closeCard(id);
      },4000);
    }
    if (getCardType(self) == "dialog"){
      document.body.addEventListener("keydown",catchCardNavigation);
      // setCardBackdropShown(true);
      if (!activeDialog() && !dialogPrevious()){
        setDialogPrevious(document.activeElement as HTMLElement);
      }
      document.querySelectorAll<MenuDropElement>("menu-drop[data-open]").forEach(menu => menu.close());
      // const transitionDuration = parseInt(`${Number(getElementStyle({ element: self, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 500}`);
      // window.setTimeout(() => {
      //   if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      //   if (previous) self.querySelector<HTMLElement>(`[data-card-previous="${previous}"]`)!.focus();
      // },transitionDuration);
      setActiveDialog(self.id as DialogID);
    }
    if (getCardType(self) == "widget") setActiveWidget(self.id as WidgetID);
  }

  function minimizeCard(id: CardID): void {
    const self = document.getElementById(id)! as HTMLDivElement;

    const workspace_tabs: HTMLDivElement = workspaceTabs()!;
    const icon = getCardControls(self).minimize.querySelector("svg")!;
    const main = self.querySelector<HTMLDivElement>(".main")!;
    const changeIdentifier = Math.random().toString();

    self.setAttribute("data-minimize-change",changeIdentifier);
    workspace_tabs.setAttribute("data-minimize-change",changeIdentifier);
    const transitionDuration = parseInt(`${Number(getElementStyle({ element: self, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
    if (!self.matches("[data-minimize]")){
      // setMinimize!(true);
      self.setAttribute("data-minimize", "");
      if (getCardControls(self) === undefined) return;
      self.style.setProperty("--card-minimize-width",`${getCardControls(self).minimize.querySelector("svg")!.clientWidth + parseInt(getElementStyle({ element: getCardControls(self).minimize, property: "--control-padding" }),10) * 2}px`);
      self.style.setProperty("--card-main-width",`${main.clientWidth}px`);
      self.style.setProperty("--card-main-height",`${main.clientHeight}px`);
      icon.replaceWith(ArrowIcon() as Element);
      window.setTimeout(() => {
        workspace_tabs.style.setProperty("--minimize-tab-width",getElementStyle({ element: self, property: "width" }));
        setTabsVisibility();
      },transitionDuration);
      if (self.contains(document.activeElement) && document.activeElement != getCardControls(self).minimize) getCardControls(self).minimize.focus();
    } else {
      // setMinimize!(false);
      self.removeAttribute("data-minimize");
      window.setTimeout(() => {
        if (self.getAttribute("data-minimize-change") == changeIdentifier) self.style.removeProperty("--card-minimize-width");
      },transitionDuration);
      self.style.removeProperty("--card-main-width");
      self.style.removeProperty("--card-main-height");
      icon.replaceWith(MinimizeIcon() as Element);
      workspace_tabs.style.removeProperty("--minimize-tab-width");
    }
    window.setTimeout(() => {
      if (self.getAttribute("data-minimize-change") == changeIdentifier) self.removeAttribute("data-minimize-change");
      if (workspace_tabs.getAttribute("data-minimize-change") == changeIdentifier) workspace_tabs.removeAttribute("data-minimize-change");
    },transitionDuration);
  }

  function closeCard(id: CardID): void {
    const self = document.getElementById(id)! as HTMLDivElement;

    // props.setActive(false);
    // self.removeAttribute("data-active");
    // if (self.matches("[data-minimize]")){
    //   const transitionDuration = parseInt(`${Number(getElementStyle({ element: self, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
    //   window.setTimeout(() => minimizeCard(id),transitionDuration);
    // }
    if (getCardType(self) == "dialog"){
      const workspace_editors: HTMLDivElement = workspaceEditors()!;
      document.body.removeEventListener("keydown",catchCardNavigation);
      // setCardBackdropShown(false);
      setActiveDialog(null);
      if (dialogPrevious()){
        const hidden = (getElementStyle({ element: dialogPrevious()!, property: "visibility" }) == "hidden");
        (!workspace_editors.contains(dialogPrevious()!) && !hidden) ? dialogPrevious()!.focus({ preventScroll: true }) : activeEditor()?.ref.focus({ preventScroll: true });
        setDialogPrevious(null);
      }
    }
    if (getCardType(self) == "widget") setActiveWidget(null);
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
    const navigable = getNavigableElements({ container: document.getElementById(activeDialog()!)!, scope: true });
    event.preventDefault();
    navigable[((!event.shiftKey) ? 0 : navigable.length - 1)]?.focus();
  }

  function getCardType(self: HTMLDivElement): CardType {
    return self.getAttribute("data-type")! as CardType;
  }

  function getCardControls(self: HTMLDivElement): CardControls {
    const controls: HTMLButtonElement[] = [...self.querySelectorAll<HTMLButtonElement>(".card-controls .control")];
    const [minimize, close] = controls as [HTMLButtonElement, HTMLButtonElement];
    return { minimize, close };
  }

export interface GetNavigableElementsOptions {
  container: HTMLElement;
  scope?: boolean | string;
}