import { env } from "cloudflare:workers";

export type Auth0User = {
  sub: string;
  email: string | null;
  name: string | null;
  picture: string | null;
};

function runtimeValue(key: string) {
  return (env as unknown as Record<string, string | undefined>)[key]?.trim() || "";
}

export function auth0Config() {
  return {
    domain: runtimeValue("AUTH0_DOMAIN").replace(/^https?:\/\//, "").replace(/\/$/, ""),
    clientId: runtimeValue("AUTH0_CLIENT_ID"),
    emailConnection: runtimeValue("AUTH0_EMAIL_CONNECTION") || "Username-Password-Authentication",
  };
}

export function isAuth0Configured() {
  const { domain, clientId } = auth0Config();
  return Boolean(domain && clientId && /^[a-z0-9.-]+$/i.test(domain));
}

export async function getAuth0User(request: Request): Promise<Auth0User | null> {
  const { domain } = auth0Config();
  const authorization = request.headers.get("authorization") || "";
  if (!domain || !/^Bearer\s+\S+$/i.test(authorization) || !/^[a-z0-9.-]+$/i.test(domain)) return null;

  try {
    const response = await fetch(`https://${domain}/userinfo`, {
      headers: { Authorization: authorization },
    });
    if (!response.ok) return null;
    const data = await response.json() as Record<string, unknown>;
    if (typeof data.sub !== "string" || data.sub.length < 3 || data.sub.length > 200) return null;
    return {
      sub: data.sub,
      email: typeof data.email === "string" ? data.email : null,
      name: typeof data.name === "string" ? data.name : null,
      picture: typeof data.picture === "string" ? data.picture : null,
    };
  } catch {
    return null;
  }
}
