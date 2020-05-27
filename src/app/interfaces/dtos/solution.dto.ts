export type TestOrCreateSolutionDto = {
  exerciseId: string;
  programmingLanguage: string;
  softwareDevelopmentMethod: string;
  functionCallCode: string;
  solutionCode: string;
  testCode?: string;
  pairUserId?: string;
};
