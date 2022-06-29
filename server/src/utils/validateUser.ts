import { FieldError } from "../resolvers/User";
import { UsernamePasswordInput } from "../resolvers/UsernamePasswordInput";
const USERNAME_LENGTH = 2;
const PASSWORD_LENGTH = 2;

const INVALID_EMAIL_ERROR = {
  field: "email",
  message: "invalid email",
};
const USERNAME_LENGTH_ERROR = {
  field: "username",
  message: `length must be greater than ${USERNAME_LENGTH}`,
};
const PASSWORD_LENGTH_ERROR = {
  field: "password",
  message: `length must be greater than ${PASSWORD_LENGTH}`,
};
const invalidEmailCheck = (email: string) => {
  return !email.includes("@");
};
const usernameLengthCheck = (username: string) => {
  return username.length <= USERNAME_LENGTH;
};
const passwordLengthCheck = (password: string) => {
  return password.length <= PASSWORD_LENGTH;
};
export const validateRegister = (
  options: UsernamePasswordInput
): FieldError[] | null => {
  let errors = [];
  if (invalidEmailCheck(options.email!)) errors.push(INVALID_EMAIL_ERROR);
  if (usernameLengthCheck(options.username!))
    errors.push(USERNAME_LENGTH_ERROR);
  if (passwordLengthCheck(options.password)) errors.push(PASSWORD_LENGTH_ERROR);

  return errors.length > 0 ? errors : null;
};
