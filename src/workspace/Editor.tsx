export type EditorID = `editor_${number}`;

export interface Editor {
  id: EditorID;
  name: string;
  value: string;
}
