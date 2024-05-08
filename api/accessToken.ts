import { repository } from '@/api/repository';
import {
  InvalidRefreshTokenResponseError,
  NotLoggedInError,
} from './apiErrors';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const ACCESS_TOKEN_EXPIRATION_DATE_KEY = 'accessTokenExpirationDate';
const OPERATOR_ID_KEY = 'operatorId';

export function setTokens({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken: string | undefined;
}) {
  const jwt = decodeJwt(accessToken);
  const exp = jwt.exp;
  if (typeof exp !== 'number') {
    throw new Error('Invalid JWT Token');
  }
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (typeof refreshToken !== 'undefined') {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  sessionStorage.setItem(ACCESS_TOKEN_EXPIRATION_DATE_KEY, exp.toString());
  jwt.operator_id && sessionStorage.setItem(OPERATOR_ID_KEY, jwt.operator_id);
}

function getTokens(): {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpirationDate: string | null;
} {
  return {
    accessToken: sessionStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: sessionStorage.getItem(REFRESH_TOKEN_KEY),
    accessTokenExpirationDate: sessionStorage.getItem(
      ACCESS_TOKEN_EXPIRATION_DATE_KEY
    ),
  };
}

function decodeJwt(token: string): { exp?: number; operator_id?: string; } {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(
    decodeURIComponent(
      atob(base64).replace(/[^a-zA-Z0-9@*_+\-./]/g, (m) => {
        const code = m.charCodeAt(0);
        return '%' + ('00' + code.toString(16)).slice(-2).toUpperCase();
      })
    )
  );
}

// トークンの有効時間の検証時に考慮するネットワーク遅延時間 (sec)
const NETWORK_ARRIVAL_GRACE_TIME = 10;

export async function getAccessToken() {
  function isAccessTokenExpired(accessTokenExpirationDate: string) {
    const currentTime = Math.floor(Date.now() / 1000);

    // トークンの有効期限と現在の時間を比較
    // ネットワークの到達遅延時間を考慮し、有効時間をその分差し引く
    return (
      parseInt(accessTokenExpirationDate) - NETWORK_ARRIVAL_GRACE_TIME <
      currentTime
    );
  }

  const { accessToken, accessTokenExpirationDate, refreshToken } = getTokens();

  if (!accessToken || !accessTokenExpirationDate || !refreshToken) {
    throw new NotLoggedInError();
  }
  if (!isAccessTokenExpired(accessTokenExpirationDate)) {
    return accessToken;
  }
  const { accessToken: newAccessToken } = await repository.refreshAccessToken({
    refreshToken,
  });
  if (!newAccessToken) {
    throw new InvalidRefreshTokenResponseError();
  }
  setTokens({ accessToken: newAccessToken, refreshToken });

  return newAccessToken;
}

export function deleteAccessToken() {
  sessionStorage.clear();
}

export function getOperatorId() {
  const operatorId = sessionStorage.getItem(OPERATOR_ID_KEY);
  if (operatorId === null) {
    throw new NotLoggedInError();
  }
  return operatorId;
}
