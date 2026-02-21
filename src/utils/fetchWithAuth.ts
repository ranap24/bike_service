/**
 * A fetch wrapper that automatically refreshes the access token on 401 responses.
 * Pass the current session and a setter so the refreshed token gets persisted.
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit,
  accessToken: string,
  onTokenRefreshed: (newToken: string) => void,
  onAuthFailure: () => void,
): Promise<Response> {
  // Inject current token
  const authOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      authorization: `Bearer ${accessToken}`,
    },
  };

  let res = await fetch(url, authOptions);

  // If unauthorized, attempt a silent token refresh
  if (res.status === 401) {
    const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      const newToken: string = refreshData?.data?.accessToken;
      if (newToken) {
        onTokenRefreshed(newToken);
        // Retry the original request with the new token
        res = await fetch(url, {
          ...options,
          headers: { ...options.headers, authorization: `Bearer ${newToken}` },
        });
      } else {
        onAuthFailure();
      }
    } else {
      onAuthFailure();
    }
  }

  return res;
}
