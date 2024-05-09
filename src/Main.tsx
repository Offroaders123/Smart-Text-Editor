import ClearedCacheCard from "./ClearedCacheCard.js";
import ColorPickerCard from "./ColorPickerCard.js";
import JSONFormatterCard from "./JSONFormatterCard.js";
import PreviewBaseCard from "./PreviewBaseCard.js";
import ReplaceTextCard from "./ReplaceTextCard.js";
import ResetSettingsCard from "./ResetSettingsCard.js";
import SettingsCard from "./SettingsCard.js";
import ThemeCard from "./ThemeCard.js";
import URIEncoderCard from "./URIEncoderCard.jsx";
import UUIDGeneratorCard from "./UUIDGeneratorCard.js";

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
      <SettingsCard/>
      <ThemeCard/>
      <PreviewBaseCard/>
      <ResetSettingsCard/>
      <ClearedCacheCard/>
      <ReplaceTextCard/>
      <ColorPickerCard/>
      <JSONFormatterCard/>
      <URIEncoderCard/>
      <UUIDGeneratorCard/>
    </main>
  );
}