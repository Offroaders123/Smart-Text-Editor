import Editor from "./Editor.js";
import STE from "./STE.js";
import Tools from "./Tools.js";
import { createDisplay, createWindow, openFiles, refreshPreview, saveFile, setOrientation, setPreviewSource, setView } from "./Workspace.js";
import { clearSiteCaches, showInstallPrompt } from "./dom.js";

export function Header() {
  return (
    <header id="header">
      <div class="app-region"></div>
      <div class="app-icon">
        <img src="./img/icon.svg" alt=""/>
      </div>
      <div id="app_menubar" class="app-menubar">
        <menu-drop id="file_menu">
          <button>File</button>
          <ul>
            <li onclick={() => new Editor({ autoReplace: false })} data-shortcuts='{ "default": "Ctrl+Shift+X", "macOS": "Shift+Cmd+X" }'>New Editor</li>
            <li part="create-window-option" onclick={() => createWindow()} data-shortcuts='{ "default": "Ctrl+Shift+C", "macOS": "Shift+Cmd+C" }'>New Window</li>
            <li onclick={() => openFiles()} data-shortcuts='{ "default": "Ctrl+O", "macOS": "Cmd+O" }'>Open</li>
            <li onclick={() => STE.activeEditor?.rename()} data-shortcuts='{ "default": "Ctrl+Shift+R", "macOS": "Shift+Cmd+R" }'>Rename</li>
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
                <li onclick={() => Tools.insertTemplate('html')} data-shortcuts='{ "default": "Ctrl+Shift+H", "macOS": "Shift+Cmd+H" }'>HTML</li>
                <li onclick={() => Tools.insertTemplate('pack-manifest-bedrock')}>Pack Manifest - Bedrock</li>
              </ul>
            </li>
            <li>Online Resources...
              <ul data-show-icons>
                <li><a href="https://webformatter.com"><img src="./src/img/web-formatter.svg" alt=""/>Code Formatter</a></li>
                <li><a href="https://www.sharedrop.io"><img part="invert" src="./src/img/sharedrop.svg" alt=""/>File Transferer</a></li>
                <li><a href="https://www.diffchecker.com/"><img src="./src/img/diffchecker.svg" alt=""/>Difference Finder</a></li>
                <li><a href="https://caniuse.com/"><img src="./src/img/caniuse.svg" alt=""/>Compatibility Checker</a></li>
                <li><a href="https://web.dev/measure/"><img src="./src/img/webdev.svg" alt=""/>Performance Tester</a></li>
                <li><a href="https://realfavicongenerator.net/"><img part="rounded" src="./src/img/real-favicon-generator.svg" alt=""/>Favicon Generator</a></li>
                <li><a href="https://appsco.pe/developer/splash-screens/"><img part="invert" src="./src/img/appscope.svg" alt=""/>Splash Generator</a></li>
                <li><a href="https://www.svgminify.com/"><img src="./src/img/svgminify.svg" alt=""/>SVG Simplifier</a></li>
                <li><a href="https://cryptii.com/"><img src="./src/img/cryptii.svg" alt=""/>Text Encryptor</a></li>
              </ul>
            </li>
          </ul>
        </menu-drop>
        <menu-drop id="settings_menu" data-alternate>
          <button onclick={() => settings_card.open()}>Settings</button>
          <ul data-show-icons>
            <li part="install-option" onclick={() => showInstallPrompt()}><img src="./src/img/install.svg" alt=""/>Install</li>
            <li onclick={() => theme_card.open()}><img src="./src/img/template.svg" alt=""/>Theme Settings</li>
            <li part="clear-site-caches-option" onclick={() => clearSiteCaches()}><img src="./src/img/settings.svg" alt=""/>Clear Cache</li>
            <li onclick={() => STE.settings.reset({ confirm: true })}><img src="./src/img/settings.svg" alt=""/>Reset Settings</li>
          </ul>
        </menu-drop>
      </div>
      <div id="app_omnibox" class="app-omnibox">
        <button id="install_option" class="option" title="Install" onclick={() => showInstallPrompt()}><svg><use href="#install_icon"/></svg></button>
        <button class="option" title="Refresh Preview" onclick={() => refreshPreview({ force: true })}><svg><use href="#refresh_icon"/></svg></button>
        <a class="option" href="https://github.com/Offroaders123/Smart-Text-Editor" title="Smart Text Editor on GitHub"><svg><use href="#github_icon"/></svg></a>
      </div>
    </header>
  );
}