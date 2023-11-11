import { showInstallPrompt } from "./dom.js";
import { refreshPreview } from "./Workspace.js";

import Icon from "../public/img/icon.svg";

export default function Header(){
  return (
    <header>
      <div className="app-region"/>
      <div className="app-icon">
        <img src={Icon} alt=""/>
      </div>
      <div className="app-menubar">
      </div>
      <div className="app-omnibox">
        <button className="option" title="Install" onClick={showInstallPrompt}><svg><use href="#install_icon"/></svg></button>
        <button className="option" title="Refresh Preview" onClick={() => refreshPreview({ force: true })}><svg><use href="#refresh_icon"/></svg></button>
        <a className="option" href="https://github.com/Offroaders123/Smart-Text-Editor" title="Smart Text Editor on GitHub"><svg><use href="#github_icon"/></svg></a>
      </div>
    </header>
  );
}