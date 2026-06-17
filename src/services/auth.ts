const AUTH_BASE_PATH = "/api/auth";

export type UserProfile = {
  id: string;
  username: string;
  nickname: string;
  email: string | null;
  avatarUrl: string | null;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: "bearer";
  expiresIn: number;
  user: UserProfile;
};

export type UpdateUserProfileRequest = {
  nickname?: string;
  email?: string | null;
  avatarUrl?: string | null;
};

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

type LoginRequest = {
  username: string;
  password: string;
};

const authUrl = (path = "") => `${AUTH_BASE_PATH}${path}`;

const readErrorMessage = async (response: Response) => {
  try {
    const body = (await response.json()) as { detail?: string };
    return body.detail ?? response.statusText;
  } catch {
    return response.statusText;
  }
};

const assertOk = async (response: Response) => {
  if (response.ok) return;
  throw new AuthError(await readErrorMessage(response), response.status);
};

const authorizationHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`
});

export const login = async ({ username, password }: LoginRequest) => {
  const response = await fetch(authUrl("/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  });

  await assertOk(response);
  return (await response.json()) as LoginResponse;
};

export const getCurrentUser = async (accessToken: string) => {
  const response = await fetch(authUrl("/me"), {
    cache: "no-store",
    headers: authorizationHeaders(accessToken)
  });

  await assertOk(response);
  return (await response.json()) as UserProfile;
};

export const logout = async (accessToken: string) => {
  const response = await fetch(authUrl("/logout"), {
    method: "POST",
    headers: authorizationHeaders(accessToken)
  });

  await assertOk(response);
};

export const updateCurrentUser = async (
  accessToken: string,
  payload: UpdateUserProfileRequest
) => {
  const response = await fetch(authUrl("/me"), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authorizationHeaders(accessToken)
    },
    body: JSON.stringify(payload)
  });

  await assertOk(response);
  return (await response.json()) as UserProfile;
};
