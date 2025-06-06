import { cookies } from "next/headers";

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = cookies();
  const token = (await cookieStore).get("auth_token");
  return token?.value || null;
}
