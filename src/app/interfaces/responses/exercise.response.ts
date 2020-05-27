export type GetMyExercisesResponse = {
  _id: string;
  createdAt: Date;
  name: string;
  createdBy: { _id: string; userName: string };
}[];

export type GetExercisesResponse = GetMyExercisesResponse;

export type GetExerciseResponse = {
  createdBy: { _id: string; userName: string };
  name: string;
  description: string;
  testCases?: { description: string }[];
};
