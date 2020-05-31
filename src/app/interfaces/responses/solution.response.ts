export type GetMySolutionsResponse = {
  solvedAt: Date;
  pairUser: { _id: string; name: string };
  exercise: { _id: string; name: string };
  programmingLanguage: string;
  softwareDevelopmentMethod: string;
  code: string;
}[];

export type TestOrCreateSolutionResponse = {
  builtInTestResults: TestResults;
  ownTestResults?: TestResults;
};

export type TestResults = {
  results?: { name: string; status: string }[];
  error?: string;
};
