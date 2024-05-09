import { Alert, Dialog, Widget } from "./Card.js";
import Checkbox from "./Checkbox.js";
import { settings, appearance } from "./STE.js";
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
      <Dialog
        id="settings_card"
        headingText="Settings"
        mainContent={[
          <div class="item list start">
            <div class="select">
              <label>Default Orientation:</label>
              <menu-drop id="default_orientation_setting" data-select>
                <button>Horizontal</button>
                <ul>
                  <li
                    data-value="horizontal"
                    onclick={() => settings.defaultOrientation = 'horizontal'}
                    data-selected>
                    Horizontal
                  </li>
                  <li
                    data-value="vertical"
                    onclick={() => settings.defaultOrientation = 'vertical'}>
                    Vertical
                  </li>
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
        ]}
        options={[
          <>
            <button
              id="install_button"
              onclick={() => showInstallPrompt()}>
              <svg>
                <use href="#install_icon"/>
              </svg>
              Install
            </button>
            <button
              id="theme_button"
              onclick={() => theme_card.open()}
              data-card-previous="theme_card">
              Customize Theme
              <svg>
                <use href="#arrow_icon"/>
              </svg>
            </button>
          </>,
          <>
            <button
              id="clear_site_caches_button"
              class="warning"
              onclick={() => clearSiteCaches()}>
              Clear Cache
            </button>
            <button
              class="warning"
              onclick={() => settings.reset({ confirm: true })}>
              Reset Settings
            </button>
          </>
        ]}
      />
      <Dialog
        id="theme_card"
        cardParent="settings_card"
        headingText="Theme"
        mainContent={[
          <div class="item list">
            <span style="line-height: 1.6;">Custom workspace theme settings<br/>will be featured in a later update.</span>
          </div>,
          // <div class="item list expand">
          //   <num-text
          //     ref={ref => applyEditingBehavior(ref)}
          //     id="theme_setting"
          //     placeholder="CSS to modify..."
          //   />
          // </div>
        ]}
        // options={[
        //   <button
        //     onclick={() => resetTheme()}>
        //     Reset Theme
        //   </button>
        // ]}
      />
      <Dialog
        id="preview_base_card"
        headingText="Base URL"
        mainContent={[
          <div class="item list expand">
            <input
              ref={ref => applyEditingBehavior(ref)}
              id="preview_base_input"
              type="url"
            />
          </div>
        ]}
        options={[
          <button
            onclick={() => preview_base_input.reset()}>
            Reset
          </button>
        ]}
      />
      <Alert
        id="reset_settings_card"
        headingText="Reset Settings"
        headingIcon={Settings}
        mainContent={[
          <div class="item">Your settings have been reset!</div>
        ]}
      />
      <Alert
        id="cleared_cache_card"
        headingText="Cleared Cache"
        headingIcon={Template}
        mainContent={[
          <div class="item">Successfully cleared offline cache!</div>
        ]}
      />
      <Widget
        id="replace_text_card"
        headingText="Replace Text"
        mainContent={[
          <div class="item list expand">
            <num-text
              ref={ref => applyEditingBehavior(ref)}
              id="replacer_find"
              placeholder="Text to find..."
            />
            <num-text
              ref={ref => applyEditingBehavior(ref)}
              id="replacer_replace"
              placeholder="Replace with..."
            />
          </div>
        ]}
        options={[
          <>
            <button onclick={() => replaceText.replace()}>Replace</button>
            <button onclick={() => replaceText.flip()}>Flip</button>
            <button onclick={() => replaceText.clear()}>Clear</button>
          </>
        ]}
      />
      <Widget
        id="color_picker_card"
        headingText="Color Picker"
        mainContent={[
          <div class="item list">
            <div id="picker_preview"></div>
            <input
              ref={ref => applyEditingBehavior(ref)}
              id="picker_input"
              type="text"
              value="#ee8800"
              maxlength="7"
              placeholder="#rrggbb"
            />
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
          <>
            <button onclick={() => /* copyPicker() */ {}}>Copy</button>
            <button onclick={() => /* insertPicker() */ {}}>Insert</button>
            <button onclick={() => /* deletePicker() */ {}}>Delete</button>
          </>
        ]}
      />
      <Widget
        id="json_formatter_card"
        headingText="JSON Formatter"
        mainContent={[
          <div class="item expand">
            <num-text
              ref={ref => applyEditingBehavior(ref)}
              id="formatter_input"
              class="expand"
              syntax-language="json"
              placeholder="JSON data to format..."
            />
          </div>
        ]}
        options={[
          <>
            <button onclick={() => jsonFormatter.format()}>Format</button>
            <button onclick={() => jsonFormatter.collapse()}>Collapse</button>
            <button onclick={() => jsonFormatter.clear()}>Clear</button>
          </>
        ]}
      />
      <Widget
        id="uri_encoder_card"
        headingText="URI Encoder"
        mainContent={[
          <div class="item expand">
            <num-text
              ref={ref => applyEditingBehavior(ref)}
              id="encoder_input"
              class="expand"
              placeholder="Text to encode..."
            />
          </div>
        ]}
        options={[
          <>
            <button onclick={() => uriEncoder.encode()}>Encode</button>
            <button onclick={() => uriEncoder.decode()}>Decode</button>
            <button onclick={() => uriEncoder.clear()}>Clear</button>
          </>,
          <Checkbox id="encoder_type">Enable URI Component</Checkbox>
        ]}
      />
      <Widget
        id="uuid_generator_card"
        headingText="UUID Generator"
        mainContent={[
          <div class="item expand">
            <input
              ref={ref => applyEditingBehavior(ref)}
              id="generator_output"
              type="text"
              placeholder="Result..."
              readonly
            />
          </div>
        ]}
        options={[
          <button onclick={() => generator_output.value = uuidGenerator.generate()}>Generate</button>
        ]}
      />
    </main>
  );
}