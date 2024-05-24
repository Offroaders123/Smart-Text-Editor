import DecorativeImage from "./DecorativeImage.js";
import Menubar from "./Menubar.js";
import { refreshPreview } from "./Workspace.js";
import { showInstallPrompt } from "./dom.js";
import Icon from "/img/icon.svg";
import "./Header.scss";

import type { JSX } from "solid-js";

export function Header() {
  return (
    <header id="header">
      <div class="app-region"/>
      <div class="app-icon">
        <DecorativeImage
          src={Icon}
          alt=""
        />
      </div>
      <Menubar/>
      <Omnibox/>
    </header>
  );
}

function Omnibox() {
  return (
    <div class="app-omnibox">
      <OmniboxButton
        id="install_option"
        title="Install"
        onclick={() => showInstallPrompt()}
        icon="#install_icon"
      />
      <OmniboxButton
        title="Refresh Preview"
        onclick={() => refreshPreview({ force: true })}
        icon="#refresh_icon"
      />
      <OmniboxAnchor
        href="https://github.com/Offroaders123/Smart-Text-Editor"
        title="Smart Text Editor on GitHub"
        icon="#github_icon"
      />
    </div>
  );
}

interface OmniboxButtonProps {
  id?: string;
  title: string;
  onclick: JSX.CustomEventHandlersLowerCase<HTMLButtonElement>["onclick"];
  icon: string;
}

function OmniboxButton(props: OmniboxButtonProps) {
  return (
    <button
      id={props.id}
      class="option"
      title={props.title}
      tabindex={-1}
      onclick={props.onclick}
      onmousedown={event => event.preventDefault()}>
      <OmniboxIcon href={props.icon}/>
    </button>
  );
}

interface OmniboxAnchorProps {
  href: string;
  title: string;
  icon: string;
}

function OmniboxAnchor(props: OmniboxAnchorProps) {
  return (
    <a
      class="option"
      href={props.href}
      title={props.title}
      tabindex={-1}
      onmousedown={event => event.preventDefault()}>
      <OmniboxIcon href={props.icon}/>
    </a>
  );
}

interface OmniboxIconProps {
  href: string;
}

function OmniboxIcon(props: OmniboxIconProps) {
  return (
    <svg>
      <use href={props.href}/>
    </svg>
  );
}