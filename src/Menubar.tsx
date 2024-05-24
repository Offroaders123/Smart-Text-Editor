import { createEffect } from "solid-js";
import DecorativeImage from "./DecorativeImage.js";
import Editor from "./Editor.js";
import { activeEditor, settings } from "./STE.js";
import { insertTemplate } from "./Tools.js";
import { createDisplay, createWindow, openFiles, refreshPreview, saveFile, setOrientation, setPreviewSource, setView } from "./Workspace.js";
import { clearSiteCaches, showInstallPrompt } from "./dom.js";
import WebFormatter from "./img/web-formatter.svg";
import Sharedrop from "./img/sharedrop.svg";
import Diffchecker from "./img/diffchecker.svg";
import Caniuse from "./img/caniuse.svg";
import WebDev from "./img/webdev.svg";
import RealFaviconGenerator from "./img/real-favicon-generator.svg";
import Appscope from "./img/appscope.svg";
import SVGMinify from "./img/svgminify.svg";
import Cryptii from "./img/cryptii.svg";
import Install from "./img/install.svg";
import Template from "./img/template.svg";
import Settings from "./img/settings.svg";

export default function Menubar() {
  let appMenubar: HTMLDivElement;

  createEffect(() => {
    for (const menu of appMenubar.querySelectorAll("menu-drop")){
      menu.addEventListener("pointerenter",event => {
        if (event.pointerType !== "mouse") return;
        if (appMenubar.querySelectorAll("menu-drop:not([data-alternate])[data-open]").length === 0 || menu.matches("[data-alternate]") || menu.matches("[data-open]")) return;
        menu.opener.focus();
        for (const menu of appMenubar.querySelectorAll<MenuDropElement>("menu-drop[data-open]")){
          menu.close();
        }
        menu.open();
      });
    }
  });

  return (
    <div ref={appMenubar!} class="app-menubar">
      <menu-drop id="file_menu">
        <button>File</button>
        <ul>
          <li onclick={() => new Editor({ autoReplace: false })} data-shortcuts='{ "default": "Ctrl+Shift+X", "macOS": "Shift+Cmd+X" }'>New Editor</li>
          <li part="create-window-option" onclick={() => createWindow()} data-shortcuts='{ "default": "Ctrl+Shift+C", "macOS": "Shift+Cmd+C" }'>New Window</li>
          <li onclick={() => openFiles()} data-shortcuts='{ "default": "Ctrl+O", "macOS": "Cmd+O" }'>Open</li>
          <li onclick={() => activeEditor()?.rename()} data-shortcuts='{ "default": "Ctrl+Shift+R", "macOS": "Shift+Cmd+R" }'>Rename</li>
          <li onclick={() => saveFile()} data-shortcuts='{ "default": "Ctrl+S", "macOS": "Cmd+S" }'>Save</li>
          <li>Save As...
            <ul>
              <li onclick={() => saveFile('txt')} data-shortcuts='{ "default": ".txt" }'>Plain Text</li>
              <li onclick={() => saveFile('html')} data-shortcuts='{ "default": ".html" }'>HTML</li>
              <li onclick={() => saveFile('css')} data-shortcuts='{ "default": ".css" }'>CSS</li>
              <li onclick={() => saveFile('js')} data-shortcuts='{ "default": ".js" }'>JavaScript</li>
              <li onclick={() => saveFile('json')} data-shortcuts='{ "default": ".json" }'>JSON</li>
              <li onclick={() => saveFile('svg')} data-shortcuts='{ "default": ".svg" }'>SVG</li>
              <li>More...
                <ul>
                  <li onclick={() => saveFile('webmanifest')} data-shortcuts='{ "default": ".webmanifest" }'>Web Manifest</li>
                  <li onclick={() => saveFile('md')} data-shortcuts='{ "default": ".md" }'>Markdown</li>
                  <li onclick={() => saveFile('mcmeta')} data-shortcuts='{ "default": ".mcmeta" }'>MCMETA</li>
                  <li onclick={() => saveFile('xml')} data-shortcuts='{ "default": ".xml" }'>XML</li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </menu-drop>
      <menu-drop id="view_menu" data-select="no-appearance">
        <button>View</button>
        <ul>
          <li data-selected onclick={() => setView('code')} data-shortcuts='{ "default": "Ctrl+Shift+1", "macOS": "Ctrl+Cmd+1" }' data-value="code">Code</li>
          <li onclick={() => setView('split')} data-shortcuts='{ "default": "Ctrl+Shift+2", "macOS": "Ctrl+Cmd+2" }' data-value="split">Split</li>
          <li onclick={() => setView('preview')} data-shortcuts='{ "default": "Ctrl+Shift+3", "macOS": "Ctrl+Cmd+3" }' data-value="preview">Preview</li>
          <li><hr/></li>
          <li onclick={() => setOrientation()} data-shortcuts='{ "default": "Ctrl+Shift+4", "macOS": "Ctrl+Cmd+4" }' data-no-select>Orientation</li>
          <li onclick={() => createDisplay()} data-shortcuts='{ "default": "Ctrl+Shift+5", "macOS": "Ctrl+Cmd+5" }' data-no-select>Display</li>
        </ul>
      </menu-drop>
      <menu-drop id="preview_menu" data-select="no-appearance">
        <button>Preview</button>
        <ul>
          <li onclick={() => refreshPreview({ force: true })} data-shortcuts='{ "default": "Ctrl+Shift+Enter", "macOS": "Ctrl+Cmd+Return" }' data-no-select>Refresh</li>
          <li onclick={() => preview_base_card.open()} data-shortcuts='{ "default": "Ctrl+Shift+B", "macOS": "Ctrl+Cmd+B" }' data-no-select>Base URL</li>
          <li><hr/></li>
          <li data-value="active-editor" data-selected onclick={() => setPreviewSource(null)}>Active Editor</li>
        </ul>
      </menu-drop>
      <menu-drop id="tools_menu">
        <button>Tools</button>
        <ul>
          <li onclick={() => replace_text_card.open()} data-shortcuts='{ "default": "Ctrl+Shift+F", "macOS": "Shift+Cmd+F" }'>Replace Text</li>
          {/* <li onclick={() => color_picker_card.open()} data-shortcuts='{ "default": "Ctrl+Shift+K", "macOS": "Shift+Cmd+K" }'>Color Picker</li> */}
          <li onclick={() => json_formatter_card.open()} data-shortcuts='{ "default": "Ctrl+Shift+G", "macOS": "Shift+Cmd+G" }'>JSON Formatter</li>
          <li onclick={() => uri_encoder_card.open()} data-shortcuts='{ "default": "Ctrl+Shift+Y", "macOS": "Shift+Cmd+Y" }'>URI Encoder</li>
          <li onclick={() => uuid_generator_card.open()} data-shortcuts='{ "default": "Ctrl+Shift+O", "macOS": "Shift+Cmd+O" }'>UUID Generator</li>
          <li>Insert Templates...
            <ul>
              <li onclick={() => insertTemplate('html')} data-shortcuts='{ "default": "Ctrl+Shift+H", "macOS": "Shift+Cmd+H" }'>HTML</li>
              <li onclick={() => insertTemplate('pack-manifest-bedrock')}>Pack Manifest - Bedrock</li>
            </ul>
          </li>
          <li>Online Resources...
            <ul data-show-icons>
              <li><a href="https://webformatter.com"><DecorativeImage src={WebFormatter} alt=""/>Code Formatter</a></li>
              <li><a href="https://www.sharedrop.io"><DecorativeImage part="invert" src={Sharedrop} alt=""/>File Transferer</a></li>
              <li><a href="https://www.diffchecker.com/"><DecorativeImage src={Diffchecker} alt=""/>Difference Finder</a></li>
              <li><a href="https://caniuse.com/"><DecorativeImage src={Caniuse} alt=""/>Compatibility Checker</a></li>
              <li><a href="https://web.dev/measure/"><DecorativeImage src={WebDev} alt=""/>Performance Tester</a></li>
              <li><a href="https://realfavicongenerator.net/"><DecorativeImage part="rounded" src={RealFaviconGenerator} alt=""/>Favicon Generator</a></li>
              <li><a href="https://appsco.pe/developer/splash-screens/"><DecorativeImage part="invert" src={Appscope} alt=""/>Splash Generator</a></li>
              <li><a href="https://www.svgminify.com/"><DecorativeImage src={SVGMinify} alt=""/>SVG Simplifier</a></li>
              <li><a href="https://cryptii.com/"><DecorativeImage src={Cryptii} alt=""/>Text Encryptor</a></li>
            </ul>
          </li>
        </ul>
      </menu-drop>
      <menu-drop id="settings_menu" data-alternate>
        <button onclick={() => settings_card.open()}>Settings</button>
        <ul data-show-icons>
          <li part="install-option" onclick={() => showInstallPrompt()}><DecorativeImage src={Install} alt=""/>Install</li>
          <li onclick={() => theme_card.open()}><DecorativeImage src={Template} alt=""/>Theme Settings</li>
          <li part="clear-site-caches-option" onclick={() => clearSiteCaches()}><DecorativeImage src={Settings} alt=""/>Clear Cache</li>
          <li onclick={() => settings.reset({ confirm: true })}><DecorativeImage src={Settings} alt=""/>Reset Settings</li>
        </ul>
      </menu-drop>
    </div>
  );
}