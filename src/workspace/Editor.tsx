export type EditorID = `editor_${number}`;

export interface Editor {
  readonly identifier: EditorID;
  name: string;
  value: string;
  syntaxLanguage: string;
  syntaxHighlight: boolean;
  handle: FileSystemFileHandle | null;
  isOpen: boolean;
  active: boolean;
  autoCreated: boolean;
  focusedOverride: boolean;
  refresh: boolean;
  unsaved: boolean;
  autoReplace: boolean;
}
