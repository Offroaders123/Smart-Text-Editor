import CardBackdrop from "./CardBackdrop.js";
import ClearedCacheCard from "./ClearedCacheCard.js";
import ColorPickerCard from "./ColorPickerCard.js";
import JSONFormatterCard from "./JSONFormatterCard.js";
import Preview from "./Preview.js";
import PreviewBaseCard from "./PreviewBaseCard.js";
import ReplaceTextCard from "./ReplaceTextCard.js";
import ResetSettingsCard from "./ResetSettingsCard.js";
import Scaler from "./Scaler.js";
import SettingsCard from "./SettingsCard.js";
import ThemeCard from "./ThemeCard.js";
import URIEncoderCard from "./URIEncoderCard.js";
import UUIDGeneratorCard from "./UUIDGeneratorCard.js";
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