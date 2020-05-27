import { CodeEditorActionEvent } from '../../components/code-editor/code-editor.component.interface';

export type AddPairProgrammingRequestDto = {
  pairUserName: string;
  exerciseId: string;
  programmingLanguage: string;
  softwareDevelopmentMethod: string;
};

export type PairEditedCodeDto = {
  action: CodeEditorActionEvent['action'];
  codeEditorId: number;
};
