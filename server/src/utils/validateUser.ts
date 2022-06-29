import { FieldError } from "../resolvers/User";
import { UsernamePasswordInput } from "../resolvers/UsernamePasswordInput";
const USERNAME_MIN_LENGTH = 2;
const PASSWORD_MIN_LENGTH = 2;

export const errorGenerater = (field: string, message: string): FieldError => {
  return { field, message };
};
const invalidEmailCheck = (email: string) => {
  return !email.includes("@");
};
const usernameLengthCheck = (username: string) => {
  return username.length <= USERNAME_MIN_LENGTH;
};
const passwordLengthCheck = (password: string) => {
  return password.length <= PASSWORD_MIN_LENGTH;
};
export const validateRegister = (
  options: UsernamePasswordInput
): FieldError[] => {
  let errors = [];
  if (invalidEmailCheck(options.email!))
    errors.push(errorGenerater("email", "invalid email"));
  if (usernameLengthCheck(options.username!))
    errors.push(
      errorGenerater(
        "username",
        `length must be greater than ${USERNAME_MIN_LENGTH}`
      )
    );
  if (passwordLengthCheck(options.password))
    errors.push(
      errorGenerater(
        "password",
        `length must be greater than ${PASSWORD_MIN_LENGTH}`
      )
    );

  return errors;
};

export const validateChangePassword = (newPassword: string): FieldError[] => {
  let errors: FieldError[] = [];
  if (passwordLengthCheck(newPassword)) errors.push(
    errorGenerater(
      "newPassword",
      `length must be greater than ${PASSWORD_MIN_LENGTH}`
    ));
  return errors;
};
