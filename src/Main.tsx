import DecorativeImage from "./DecorativeImage.js";
import { settings, appearance } from "./STE.js";
import { replaceText, jsonFormatter, uriEncoder, uuidGenerator } from "./Tools.js";
import { clearSiteCaches, showInstallPrompt } from "./dom.js";
import Settings from "./img/settings.svg";
import Template from "./img/template.svg";

export function Main() {
  return (
    <main id="main">
      <div id="workspace" class="workspace">
        <div id="workspace_tabs" class="workspace-tabs">
          <button id="create_editor_button" class="create-editor-button" title="New Editor"><svg><use href="#close_icon"/></svg></button>
        </div>
        <div id="workspace_editors" class="workspace-editors"></div>
      </div>
      <div id="scaler" class="scaler"></div>
      <iframe id="preview" class="preview" src="about:blank"></iframe>
      <div id="card_backdrop" class="card-backdrop"></div>
      <ste-card id="settings_card" type="dialog">
        <div class="header">
          <span class="heading">Settings</span>
        </div>
        <div class="main">
          <div class="content">
            <div class="item list start">
              <div class="select">
                <label>Default Orientation:</label>
                <menu-drop id="default_orientation_setting" data-select>
                  <button>Horizontal</button>
                  <ul>
                    <li data-value="horizontal" onclick={() => settings.defaultOrientation = 'horizontal'} data-selected>Horizontal</li>
                    <li data-value="vertical" onclick={() => settings.defaultOrientation = 'vertical'}>Vertical</li>
                  </ul>
                </menu-drop>
              </div>
              <div class="checkbox">
                <input id="syntax_highlighting_setting" type="checkbox" oninput={event => appearance.setSyntaxHighlighting(event.currentTarget.checked)}/>
                <label for="syntax_highlighting_setting"><svg class="check"><use href="#check_icon"/></svg>Syntax Highlighting (Beta)</label>
              </div>
              <div class="checkbox">
                <input id="automatic_refresh_setting" type="checkbox" oninput={event => settings.automaticRefresh = event.currentTarget.checked} checked/>
                <label for="automatic_refresh_setting"><svg class="check"><use href="#check_icon"/></svg>Automatically Refresh Preview</label>
              </div>
            </div>
          </div>
          <div class="options">
            <button id="install_button" onclick={() => showInstallPrompt()}><svg><use href="#install_icon"/></svg>Install</button>
            <button id="theme_button" onclick={() => theme_card.open()} data-card-previous="theme_card">Customize Theme<svg><use href="#arrow_icon"/></svg></button>
          </div>
          <div class="options">
            <button id="clear_site_caches_button" class="warning" onclick={() => clearSiteCaches()}>Clear Cache</button>
            <button class="warning" onclick={() => settings.reset({ confirm: true })}>Reset Settings</button>
          </div>
        </div>
      </ste-card>
      <ste-card id="theme_card" type="dialog">
        <div class="header" data-card-parent="settings_card">
          <span class="heading">Theme</span>
        </div>
        <div class="main">
          <div class="content">
            <div class="item list">
              <span style="line-height: 1.6;">Custom workspace theme settings<br/>will be featured in a later update.</span>
            </div>
            {/* <div class="item list expand">
              <num-text id="theme_setting" placeholder="CSS to modify..."></num-text>
            </div> */}
          </div>
          {/* <div class="options">
            <button onclick={() => resetTheme()}>Reset Theme</button>
          </div> */}
        </div>
      </ste-card>
      <ste-card id="preview_base_card" type="dialog">
        <div class="header">
          <span class="heading">Base URL</span>
        </div>
        <div class="main">
          <div class="content">
            <div class="item list expand">
              <input id="preview_base_input" type="url"/>
            </div>
          </div>
          <div class="options">
            <button onclick={() => preview_base_input.reset()}>Reset</button>
          </div>
        </div>
      </ste-card>
      <ste-card id="reset_settings_card" type="alert">
        <div class="header">
          <DecorativeImage class="icon" src={Settings} alt=""/>
          <span class="heading">Reset Settings</span>
        </div>
        <div class="main">
          <div class="content">
            <div class="item">Your settings have been reset!</div>
          </div>
        </div>
      </ste-card>
      <ste-card id="cleared_cache_card" type="alert">
        <div class="header">
          <DecorativeImage class="icon" src={Template} alt=""/>
          <span class="heading">Cleared Cache</span>
        </div>
        <div class="main">
          <div class="content">
            <div class="item">Successfully cleared offline cache!</div>
          </div>
        </div>
      </ste-card>
      <ste-card id="replace_text_card" type="widget">
        <div class="header">
          <span class="heading">Replace Text</span>
        </div>
        <div class="main">
          <div class="content">
            <div class="item list expand">
              <num-text id="replacer_find" placeholder="Text to find..."></num-text>
              <num-text id="replacer_replace" placeholder="Replace with..."></num-text>
            </div>
          </div>
          <div class="options">
            <button onclick={() => replaceText.replace()}>Replace</button>
            <button onclick={() => replaceText.flip()}>Flip</button>
            <button onclick={() => replaceText.clear()}>Clear</button>
          </div>
        </div>
      </ste-card>
      <ste-card id="color_picker_card" type="widget">
        <div class="header">
          <span class="heading">Color Picker</span>
        </div>
        <div class="main">
          <div class="content">
            <div class="item list">
              <div id="picker_preview"></div>
              <input id="picker_input" type="text" value="#ee8800" maxlength="7" placeholder="#rrggbb"/>
            </div>
            <div class="item list">
              <label for="red_channel">Red</label>
              <input id="red_channel" type="range"/>
              <label for="green_channel">Green</label>
              <input id="green_channel" type="range"/>
              <label for="blue_channel">Blue</label>
              <input id="blue_channel" type="range"/>
            </div>
          </div>
          <div class="options">
            <button onclick={() => /* copyPicker() */ {}}>Copy</button>
            <button onclick={() => /* insertPicker() */ {}}>Insert</button>
            <button onclick={() => /* deletePicker() */ {}}>Delete</button>
          </div>
        </div>
      </ste-card>
      <ste-card id="json_formatter_card" type="widget">
        <div class="header">
          <span class="heading">JSON Formatter</span>
        </div>
        <div class="main">
          <div class="content">
            <div class="item expand">
              <num-text id="formatter_input" class="expand" syntax-language="json" placeholder="JSON data to format..."></num-text>
            </div>
          </div>
          <div class="options">
            <button onclick={() => jsonFormatter.format()}>Format</button>
            <button onclick={() => jsonFormatter.collapse()}>Collapse</button>
            <button onclick={() => jsonFormatter.clear()}>Clear</button>
          </div>
        </div>
      </ste-card>
      <ste-card id="uri_encoder_card" type="widget">
        <div class="header">
          <span class="heading">URI Encoder</span>
        </div>
        <div class="main">
          <div class="content">
            <div class="item expand">
              <num-text id="encoder_input" class="expand" placeholder="Text to encode..."></num-text>
            </div>
          </div>
          <div class="options">
            <button onclick={() => uriEncoder.encode()}>Encode</button>
            <button onclick={() => uriEncoder.decode()}>Decode</button>
            <button onclick={() => uriEncoder.clear()}>Clear</button>
          </div>
          <div class="options">
            <div class="checkbox">
              <input id="encoder_type" type="checkbox"/>
              <label for="encoder_type"><svg class="check"><use href="#check_icon"/></svg>Enable URI Component</label>
            </div>
          </div>
        </div>
      </ste-card>
      <ste-card id="uuid_generator_card" type="widget">
        <div class="header">
          <span class="heading">UUID Generator</span>
        </div>
        <div class="main">
          <div class="content">
            <div class="item expand">
              <input id="generator_output" type="text" placeholder="Result..." readonly/>
            </div>
          </div>
          <div class="options">
            <button onclick={() => generator_output.value = uuidGenerator.generate()}>Generate</button>
          </div>
        </div>
      </ste-card>
    </main>
  );
}