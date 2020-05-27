export type GetMyPairProgrammingRequestResponse = {
  exerciseId: string;
  programmingLanguage: string;
  softwareDevelopmentMethod: string;
  pairUser: {
    _id: string;
    userName: string;
  };
};
