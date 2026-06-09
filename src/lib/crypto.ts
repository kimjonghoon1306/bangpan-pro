import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGO = "aes-256-cbc";

function getKey(): string {
  if (process.env.RESIDENT_ENC_KEY) return process.env.RESIDENT_ENC_KEY.slice(0, 32);
  if (process.env.NODE_ENV === "production")
    throw new Error("RESIDENT_ENC_KEY 환경변수가 설정되지 않았습니다.");
  return "bangpan-pro-32byte-secret-key!!";
}

export function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGO, Buffer.from(getKey()), iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(enc: string): string {
  const [ivHex, encHex] = enc.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv(ALGO, Buffer.from(getKey()), iv);
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]);
  return decrypted.toString();
}
