export type UpdateUserDto = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

export type CreateUserDto = UpdateUserDto & {
  userName: string;
};
