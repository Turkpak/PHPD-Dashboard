 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }
import { post } from "./client";
import { setTokens } from "./client";


const LOGIN_PATH = "login-user/";

export async function login(credentials) {
  const data = await post(LOGIN_PATH, credentials);
  const access = _nullishCoalesce(data.access, () => ( data.token));
  if (access) setTokens(access, data.refresh);
  return data;
}

export { setTokens, clearTokens, getAccessToken, getRefreshToken } from "./client";
