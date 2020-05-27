export type CreateExerciseDto = {
  name: string;
  description: string;
  testCases: {
    description: string;
    matcher: string;
    expected: {
      type: string;
      value: string;
    };
    parameters: {
      type: string;
      value: string;
    }[];
  }[];
};
