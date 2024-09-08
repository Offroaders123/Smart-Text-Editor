import ArrowIcon from "./ArrowIcon.js";
import InstallIcon from "./InstallIcon.js";
import { Dialog } from "./Card.js";
import Checkbox from "./Checkbox.js";
import { appearance, settings } from "./STE.js";
import { clearSiteCaches, showInstallPrompt } from "./dom.js";

export default function SettingsCard() {
  return (
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
            <InstallIcon/>
            Install
          </button>
          <button
            id="theme_button"
            onclick={() => theme_card.open()}
            data-card-previous="theme_card">
            Customize Theme
            <ArrowIcon/>
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
  );
}