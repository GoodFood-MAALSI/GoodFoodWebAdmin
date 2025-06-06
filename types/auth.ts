export interface LoginForm {
  email: string;
  password: string;
}

export interface ForgotPasswordForm {
  email: string;
}

export type ChangePasswordForm = {
  password: string;
};