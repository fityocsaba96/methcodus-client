export type CodeEditorActionEvent = {
  action: {
    name: string;
    details: { [name: string]: any };
  };
  cancel: () => void;
};

export enum CodeEditorLanguage {
  JavaScript = 'javascript',
  Java = 'java',
}

export enum CodeEditorEditMode {
  Normal = 'normal',
  ReadOnly = 'readonly',
  Inactive = 'inactive',
}
