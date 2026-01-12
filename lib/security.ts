
import { SignJWT, jwtVerify } from "jose";

const SECRET_VAL = process.env.AUTH_SECRET || "development_secret_do_not_use_in_prod";

function getSecret() {
  if (process.env.NODE_ENV === "production" && (SECRET_VAL === "development_secret_do_not_use_in_prod" || !process.env.AUTH_SECRET)) {
    throw new Error("FATAL SECURITY: AUTH_SECRET is not set in production. Application will not start.");
  }
  return new TextEncoder().encode(SECRET_VAL);
}

const ALG = "HS256";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function signToken(payload: any): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: [ALG],
    });
    return payload;
  } catch (error) {
    return null;
  }
}
