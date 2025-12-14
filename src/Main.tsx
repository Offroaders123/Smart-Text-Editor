import ColorPickerCard from "./card/ColorPickerCard.js";
import JSONFormatterCard from "./card/JSONFormatterCard.js";
import Preview from "./workspace/Preview.js";
import ReplaceTextCard from "./card/ReplaceTextCard.js";
import Scaler from "./workspace/Scaler.js";
import URIEncoderCard from "./card/URIEncoderCard.js";
import UUIDGeneratorCard from "./card/UUIDGeneratorCard.js";
import Workspace from "./workspace/Workspace.js";
import "./Main.scss";

import type { Setter } from "solid-js";

export interface MainProps {
  setWorkspace: Setter<HTMLDivElement | null>;
  setWorkspaceEditors: Setter<HTMLDivElement | null>;
  setScaler: Setter<HTMLDivElement | null>;
  setPreview: Setter<HTMLIFrameElement | null>;
}

export function Main(props: MainProps) {
  return (
    <main>
      <Workspace
        setWorkspace={props.setWorkspace}
        setWorkspaceEditors={props.setWorkspaceEditors}
      />
      <Scaler
        setScaler={props.setScaler}
      />
      <Preview
        setPreview={props.setPreview}
      />
      <ReplaceTextCard/>
      <ColorPickerCard/>
      <JSONFormatterCard/>
      <URIEncoderCard/>
      <UUIDGeneratorCard/>
    </main>
  );
}