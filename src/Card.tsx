import { onMount, Show } from "solid-js";
import { activeDialog, dialogPrevious, setDialogPrevious, setActiveDialog, setActiveWidget, activeEditor, cardBackdropShown, setCardBackdropShown, workspaceEditors, workspaceTabs } from "./STE.js";
import DecorativeImage from "./DecorativeImage.js";
import ArrowIcon from "./ArrowIcon.js";
import BackIcon from "./BackIcon.js";
import MinimizeIcon from "./MinimizeIcon.js";
import CloseIcon from "./CloseIcon.js";
import { query, setTabsVisibility } from "./Editor.js";
import { getElementStyle } from "./dom.js";
import "./Card.scss";

import type { JSX } from "solid-js";

export interface AlertProps {
  id: string;
  headingText: string;
  headingIcon: string;
  mainContent: JSX.Element[];
}

export function Alert(props: AlertProps) {
  return (
    <Card
      id={props.id}
      type="alert"
      headingText={props.headingText}
      headingIcon={props.headingIcon}
      mainContent={props.mainContent}
    />
  );
}

export interface DialogProps {
  id: string;
  cardParent?: string;
  headingText: string;
  mainContent: JSX.Element[];
  options?: JSX.Element[];
}

export function Dialog(props: DialogProps) {
  return (
    <Card
      id={props.id}
      type="dialog"
      cardParent={props.cardParent}
      headingText={props.headingText}
      mainContent={props.mainContent}
      options={props.options}
    />
  );
}

export interface WidgetProps {
  id: string;
  headingText: string;
  mainContent: JSX.Element[];
  options: JSX.Element[];
}

export function Widget(props: WidgetProps) {
  return (
    <Card
      id={props.id}
      type="widget"
      headingText={props.headingText}
      mainContent={props.mainContent}
      options={props.options}
    />
  );
}

export type CardType = "alert" | "widget" | "dialog";

export interface CardControls extends HTMLDivElement {
  readonly minimize: HTMLButtonElement;
  readonly close: HTMLButtonElement;
}

interface CardProps {
  id: string;
  type: CardType;
  active?: boolean;
  cardParent?: string;
  headingText: string;
  headingIcon?: string;
  mainContent: JSX.Element[];
  options?: JSX.Element[];
}

/**
 * The base component for the Alert, Dialog, and Widget card types.
*/
function Card(props: CardProps) {
  let card: HTMLDivElement;

  onMount(() => {
    const type: CardType = card.getAttribute("data-type") as CardType;
    const header: HTMLDivElement = card.querySelector<HTMLDivElement>(".header")!;
    const back: HTMLButtonElement | null = card.querySelector<HTMLButtonElement>(".card-back");
    const heading: HTMLDivElement = header.querySelector<HTMLDivElement>(".heading")!;
    const controls: CardControls = Object.assign(document.createElement("div"),{
      minimize: document.createElement("button"),
      close: document.createElement("button")
    });
  
    // card.classList.add("Card");

    card.addEventListener("keydown",event => {
      if (card.getAttribute("data-type") != "dialog" || event.key != "Tab") return;
      const navigable = getNavigableElements({ container: card, scope: true });
      if (!event.shiftKey){
        if (document.activeElement != navigable[navigable.length - 1]) return;
        event.preventDefault();
        navigable[0]?.focus();
      } else if (document.activeElement == navigable[0]){
        event.preventDefault();
        navigable[navigable.length - 1]?.focus();
      }
    });

    back?.addEventListener("click",() => openCard(header.getAttribute("data-card-parent")!, card.id));

    controls.classList.add("card-controls");

    controls.minimize.classList.add("control");
    controls.minimize.setAttribute("data-control","minimize");
    controls.minimize.append(MinimizeIcon() as Element);

    controls.minimize.addEventListener("keydown",event => {
      if (event.key != "Enter") return;
      event.preventDefault();
      if (event.repeat) return;
      controls?.minimize.click();
    });

    controls.minimize.addEventListener("click",() => minimizeCard(card.id));

    controls.close.classList.add("control");
    controls.close.setAttribute("data-control","close");
    controls.close.append(CloseIcon() as Element);

    controls.close.addEventListener("click",() => closeCard(card.id));

    controls.appendChild(controls.minimize);
    controls.appendChild(controls.close);
    header.appendChild(controls);
  });

  return (
    <div
      id={props.id}
      class="Card"
      data-type={props.type}
      ref={card!}>
      <div class="header" data-card-parent={props.type === "dialog" && props.cardParent}>
        <Show when={props.type === "alert"}>
          <DecorativeImage class="icon" src={props.headingIcon!} alt=""/>
        </Show>
        <Show when={props.type === "dialog"}>
          <button class="card-back">
            <BackIcon/>
          </button>
        </Show>
        <span class="heading">{props.headingText}</span>
      </div>
      <div class="main">
        <div class="content">
          {props.mainContent}
        </div>
        {props.options?.map(row => <div class="options">{row}</div>)}
      </div>
    </div>
  );
}

  export function openCard(id: string, previous?: string): void {
    const self = document.getElementById(id)! as HTMLDivElement;

    if (self.matches("[data-active]") && !self.hasAttribute("data-alert-timeout")) return closeCard(id);
    if (getCardType(self) != "alert"){
      document.querySelectorAll<HTMLDivElement>(`.Card[data-active]`).forEach(card => {
        if (getCardType(card) != "dialog" && getCardType(card) != getCardType(self)) return;
        closeCard(card.id);
        if (!card.matches(".minimize")) return;
        const transitionDuration = parseInt(`${Number(getElementStyle({ element: card, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
        window.setTimeout(() => minimizeCard(card.id),transitionDuration);
      });
    }
    self.setAttribute("data-active","");
    if (getCardType(self) == "widget" && cardBackdropShown()) setCardBackdropShown(false);
    if (getCardType(self) == "alert"){
      const timeoutIdentifier = Math.random().toString();
      self.setAttribute("data-alert-timeout",timeoutIdentifier);
      window.setTimeout(() => {
        if (self.getAttribute("data-alert-timeout") != timeoutIdentifier) return;
        self.removeAttribute("data-alert-timeout");
        closeCard(id);
      },4000);
    }
    if (getCardType(self) == "dialog"){
      document.body.addEventListener("keydown",catchCardNavigation);
      setCardBackdropShown(true);
      if (!activeDialog() && !dialogPrevious()){
        setDialogPrevious(document.activeElement?.id ?? null);
      }
      document.querySelectorAll<MenuDropElement>("menu-drop[data-open]").forEach(menu => menu.close());
      const transitionDuration = parseInt(`${Number(getElementStyle({ element: self, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 500}`);
      window.setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        if (previous) self.querySelector<HTMLElement>(`[data-card-previous="${previous}"]`)!.focus();
      },transitionDuration);
      setActiveDialog(self.id);
    }
    if (getCardType(self) == "widget") setActiveWidget(self.id);
  }

  export function minimizeCard(id: string): void {
    const self = document.getElementById(id)! as HTMLDivElement;

    const workspace_tabs: HTMLDivElement = workspaceTabs()!;
    const icon = getCardControls(self).minimize.querySelector("svg")!;
    const main = self.querySelector<HTMLDivElement>(".main")!;
    const changeIdentifier = Math.random().toString();

    self.setAttribute("data-minimize-change",changeIdentifier);
    workspace_tabs.setAttribute("data-minimize-change",changeIdentifier);
    const transitionDuration = parseInt(`${Number(getElementStyle({ element: self, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
    if (!self.matches(".minimize")){
      self.classList.add("minimize");
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
      self.classList.remove("minimize");
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

  export function closeCard(id: string): void {
    const self = document.getElementById(id)! as HTMLDivElement;

    self.removeAttribute("data-active");
    if (self.matches(".minimize")){
      const transitionDuration = parseInt(`${Number(getElementStyle({ element: self, property: "transition-duration" }).split(",")[0]!.replace(/s/g,"")) * 1000}`);
      window.setTimeout(() => minimizeCard(id),transitionDuration);
    }
    if (getCardType(self) == "dialog"){
      const workspace_editors: HTMLDivElement = workspaceEditors()!;
      document.body.removeEventListener("keydown",catchCardNavigation);
      setCardBackdropShown(false);
      setActiveDialog(null);
      if (dialogPrevious()){
        const hidden = (getElementStyle({ element: document.getElementById(dialogPrevious()!)!, property: "visibility" }) == "hidden");
        (!workspace_editors.contains(document.getElementById(dialogPrevious()!)!) && !hidden) ? document.getElementById(dialogPrevious()!)!.focus({ preventScroll: true }) : query(activeEditor())?.ref.focus({ preventScroll: true });
        setDialogPrevious(null);
      }
    }
    if (getCardType(self) == "widget") setActiveWidget(null);
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
    return self.querySelector<CardControls>(".card-controls")!;
  }

export interface GetNavigableElementsOptions {
  container: HTMLElement;
  scope?: boolean | string;
}