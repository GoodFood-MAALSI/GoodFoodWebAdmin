import { cookies } from "next/headers";
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = cookies();
  const token = (await cookieStore).get("accessToken");
  return token?.value || null;
}
