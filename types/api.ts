export interface LoginResponse {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: {
    id: number;
    email: string;
    status: string;
    first_name: string;
    last_name: string;
    created_at: string;
    updated_at: string;
    __entity: "User";
  };
}
