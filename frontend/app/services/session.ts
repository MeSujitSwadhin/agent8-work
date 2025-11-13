import { redirect } from "@remix-run/node";

export async function requireUserSession(request: Request) {
  const cookies = request.headers.get("Cookie");

  if (!cookies || !cookies.includes("access_token")) {
    throw redirect("/signin");
  }

  const accessToken = cookies
    .split("access_token=")[1]
    ?.split(";")[0]
    ?.trim();

  if (!accessToken) {
    throw redirect("/signin");
  }

  try {
    const payloadBase64 = accessToken.split(".")[1];
    const decodedPayload = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf-8"));
    const exp = decodedPayload?.exp;

    if (!exp || typeof exp !== "number") {
      throw new Error("Invalid token payload");
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (exp < nowInSeconds) {
      const expiredCookie = `access_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax; Secure`;
      throw redirect("/signin", {
        headers: { "Set-Cookie": expiredCookie },
      });
    }

    return accessToken;
  } catch (e) {
    const invalidCookie = `access_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax; Secure`;
    throw redirect("/signin", {
      headers: { "Set-Cookie": invalidCookie },
    });
  }
}