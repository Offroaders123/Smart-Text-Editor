import CardBackdrop from "./card/CardBackdrop.js";
import ClearedCacheCard from "./card/ClearedCacheCard.js";
import ColorPickerCard from "./card/ColorPickerCard.js";
import JSONFormatterCard from "./card/JSONFormatterCard.js";
import Preview from "./Preview.js";
import PreviewBaseCard from "./card/PreviewBaseCard.js";
import ReplaceTextCard from "./card/ReplaceTextCard.js";
import ResetSettingsCard from "./card/ResetSettingsCard.js";
import Scaler from "./Scaler.js";
import SettingsCard from "./card/SettingsCard.js";
import ThemeCard from "./card/ThemeCard.js";
import URIEncoderCard from "./card/URIEncoderCard.js";
import UUIDGeneratorCard from "./card/UUIDGeneratorCard.js";
import Workspace from "./Workspace.js";
import "./Main.scss";

import type { Accessor, Setter } from "solid-js";

export interface MainProps {
  setWorkspace: Setter<HTMLDivElement | null>;
  setWorkspaceTabs: Setter<HTMLDivElement | null>;
  setCreateEditorButton: Setter<HTMLButtonElement | null>;
  setWorkspaceEditors: Setter<HTMLDivElement | null>;
  setScaler: Setter<HTMLDivElement | null>;
  setPreview: Setter<HTMLIFrameElement | null>;
  previewBase: Accessor<string | null>;
  setPreviewBase: Setter<string | null>;
}

export function Main(props: MainProps) {
  return (
    <main>
      <Workspace
        setWorkspace={props.setWorkspace}
        setWorkspaceTabs={props.setWorkspaceTabs}
        setCreateEditorButton={props.setCreateEditorButton}
        setWorkspaceEditors={props.setWorkspaceEditors}
      />
      <Scaler
        setScaler={props.setScaler}
      />
      <Preview
        setPreview={props.setPreview}
      />
      <CardBackdrop/>
      <SettingsCard/>
      <ThemeCard/>
      <PreviewBaseCard
        value={props.previewBase}
        setValue={props.setPreviewBase}
      />
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