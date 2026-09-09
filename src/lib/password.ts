import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(nodeScrypt);
const keyLength = 64;
const hashPrefix = "scrypt-v1";

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt, keyLength) as Buffer;
  return `${hashPrefix}$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`;
}

export async function verifyPassword(password: string, encodedHash: string) {
  const [prefix, saltValue, hashValue, extra] = encodedHash.split("$");
  if (prefix !== hashPrefix || !saltValue || !hashValue || extra) return false;
  try {
    const salt = Buffer.from(saltValue, "base64url");
    const storedKey = Buffer.from(hashValue, "base64url");
    if (salt.length !== 16 || storedKey.length !== keyLength) return false;
    const suppliedKey = await scrypt(password, salt, keyLength) as Buffer;
    return timingSafeEqual(storedKey, suppliedKey);
  } catch {
    return false;
  }
}
