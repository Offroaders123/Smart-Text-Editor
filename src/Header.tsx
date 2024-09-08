import DecorativeImage from "./DecorativeImage.js";
import InstallIcon from "./InstallIcon.js";
import RefreshIcon from "./RefreshIcon.js";
import GitHubIcon from "./GitHubIcon.js";
import Menubar from "./Menubar.js";
import { refreshPreview } from "./Workspace.js";
import { showInstallPrompt } from "./dom.js";
import Icon from "/img/icon.svg";
import "./Header.scss";

import type { JSX, Setter } from "solid-js";

export interface HeaderProps {
  setHeader: Setter<HTMLElement | null>;
  setViewMenu: Setter<MenuDropElement | null>;
  setPreviewMenu: Setter<MenuDropElement | null>;
}

export function Header(props: HeaderProps) {
  return (
    <header ref={props.setHeader}>
      <div class="app-region"/>
      <div class="app-icon">
        <DecorativeImage
          src={Icon}
          alt=""
        />
      </div>
      <Menubar
        setViewMenu={props.setViewMenu}
        setPreviewMenu={props.setPreviewMenu}
      />
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
        icon={<InstallIcon/>}
      />
      <OmniboxButton
        title="Refresh Preview"
        onclick={() => refreshPreview({ force: true })}
        icon={<RefreshIcon/>}
      />
      <OmniboxAnchor
        href="https://github.com/Offroaders123/Smart-Text-Editor"
        title="Smart Text Editor on GitHub"
        icon={<GitHubIcon/>}
      />
    </div>
  );
}

interface OmniboxButtonProps {
  id?: string;
  title: string;
  onclick: JSX.CustomEventHandlersLowerCase<HTMLButtonElement>["onclick"];
  icon: JSX.Element;
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
      {props.icon}
    </button>
  );
}

interface OmniboxAnchorProps {
  href: string;
  title: string;
  icon: JSX.Element;
}

function OmniboxAnchor(props: OmniboxAnchorProps) {
  return (
    <a
      class="option"
      href={props.href}
      title={props.title}
      tabindex={-1}
      onmousedown={event => event.preventDefault()}>
      {props.icon}
    </a>
  );
}