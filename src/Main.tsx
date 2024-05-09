import CardComponent from "./Card.js";
import Checkbox from "./Checkbox.js";
import { settings, appearance, setActiveDialog } from "./STE.js";
import { replaceText, jsonFormatter, uriEncoder, uuidGenerator } from "./Tools.js";
import { applyEditingBehavior, clearSiteCaches, showInstallPrompt } from "./dom.js";
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
      <CardComponent
        id="settings_card"
        type="dialog"
        headerText="Settings"
        content={
          <>
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
              <Checkbox
                id="syntax_highlighting_setting"
                oninput={event => appearance.setSyntaxHighlighting(event.currentTarget.checked)}>
                Syntax Highlighting (Beta)
              </Checkbox>
              <Checkbox
                id="automatic_refresh_setting"
                oninput={event => settings.automaticRefresh = event.currentTarget.checked}
                checked>
                Automatically Refresh Preview
              </Checkbox>
            </div>
            </>
          }
        options={[
          <>
            <button id="install_button" onclick={() => showInstallPrompt()}><svg><use href="#install_icon"/></svg>Install</button>
            <button id="theme_button" onclick={() => setActiveDialog("theme_card")} data-card-previous="theme_card">Customize Theme<svg><use href="#arrow_icon"/></svg></button>
          </>,
          <>
            <button id="clear_site_caches_button" class="warning" onclick={() => clearSiteCaches()}>Clear Cache</button>
            <button class="warning" onclick={() => settings.reset({ confirm: true })}>Reset Settings</button>
          </>
        ]}
      />
      <CardComponent
        id="theme_card"
        type="dialog"
        cardParent="settings_card"
        headerText="Theme"
        content={[
            <div class="item list">
              <span style="line-height: 1.6;">Custom workspace theme settings<br/>will be featured in a later update.</span>
            </div>,
            // <div class="item list expand">
            //   <num-text ref={ref => applyEditingBehavior(ref)} id="theme_setting" placeholder="CSS to modify..."></num-text>
            // </div>
        ]}
        options={[
          // <div class="options">
          //   <button onclick={() => resetTheme()}>Reset Theme</button>
          // </div>
        ]}
      />
      <CardComponent
        id="preview_base_card"
        type="dialog"
        headerText="Base URL"
        content={[
            <div class="item list expand">
              <input ref={ref => applyEditingBehavior(ref)} id="preview_base_input" type="url"/>
            </div>
        ]}
        options={[
          <div class="options">
            <button onclick={() => preview_base_input.reset()}>Reset</button>
          </div>
        ]}
      />
      <CardComponent
        id="reset_settings_card"
        type="alert"
        headerIcon={Settings}
        headerText="Reset Settings"
        content={[
            <div class="item">Your settings have been reset!</div>
        ]}
      />
      <CardComponent
        id="cleared_cache_card"
        type="alert"
        headerIcon={Template}
        headerText="Cleared Cache"
        content={[
           <div class="item">Successfully cleared offline cache!</div>
        ]}
      />
      <CardComponent
        id="replace_text_card"
        type="widget"
        headerText="Replace Text"
        content={[
            <div class="item list expand">
              <num-text ref={ref => applyEditingBehavior(ref)} id="replacer_find" placeholder="Text to find..."></num-text>
              <num-text ref={ref => applyEditingBehavior(ref)} id="replacer_replace" placeholder="Replace with..."></num-text>
            </div>
        ]}
        options={[
          <div class="options">
            <button onclick={() => replaceText.replace()}>Replace</button>
            <button onclick={() => replaceText.flip()}>Flip</button>
            <button onclick={() => replaceText.clear()}>Clear</button>
          </div>
        ]}
      />
      <CardComponent
        id="color_picker_card"
        type="widget"
        headerText="Color Picker"
        content={[
            <div class="item list">
              <div id="picker_preview"></div>
              <input ref={ref => applyEditingBehavior(ref)} id="picker_input" type="text" value="#ee8800" maxlength="7" placeholder="#rrggbb"/>
            </div>,
            <div class="item list">
              <label for="red_channel">Red</label>
              <input id="red_channel" type="range"/>
              <label for="green_channel">Green</label>
              <input id="green_channel" type="range"/>
              <label for="blue_channel">Blue</label>
              <input id="blue_channel" type="range"/>
            </div>
        ]}
        options={[
          <div class="options">
            <button onclick={() => /* copyPicker() */ {}}>Copy</button>
            <button onclick={() => /* insertPicker() */ {}}>Insert</button>
            <button onclick={() => /* deletePicker() */ {}}>Delete</button>
          </div>
        ]}
      />
      <CardComponent
        id="json_formatter_card"
        type="widget"
        headerText="JSON Formatter"
        content={[
            <div class="item expand">
              <num-text ref={ref => applyEditingBehavior(ref)} id="formatter_input" class="expand" syntax-language="json" placeholder="JSON data to format..."></num-text>
            </div>
        ]}
        options={[
          <div class="options">
            <button onclick={() => jsonFormatter.format()}>Format</button>
            <button onclick={() => jsonFormatter.collapse()}>Collapse</button>
            <button onclick={() => jsonFormatter.clear()}>Clear</button>
          </div>
        ]}
      />
      <CardComponent
        id="uri_encoder_card"
        type="widget"
        headerText="URI Encoder"
        content={[
            <div class="item expand">
              <num-text ref={ref => applyEditingBehavior(ref)} id="encoder_input" class="expand" placeholder="Text to encode..."></num-text>
            </div>
        ]}
        options={[
          <div class="options">
            <button onclick={() => uriEncoder.encode()}>Encode</button>
            <button onclick={() => uriEncoder.decode()}>Decode</button>
            <button onclick={() => uriEncoder.clear()}>Clear</button>
          </div>,
          <div class="options">
            <Checkbox id="encoder_type">Enable URI Component</Checkbox>
          </div>
        ]}
      />
      <CardComponent
        id="uuid_generator_card"
        type="widget"
        headerText="UUID Generator"
        content={[
            <div class="item expand">
              <input ref={ref => applyEditingBehavior(ref)} id="generator_output" type="text" placeholder="Result..." readonly/>
            </div>
        ]}
        options={[
          <div class="options">
            <button onclick={() => generator_output.value = uuidGenerator.generate()}>Generate</button>
          </div>
        ]}
      />
    </main>
  );
}