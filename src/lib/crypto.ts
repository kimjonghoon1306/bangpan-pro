import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ENC_KEY = (() => {
  if (process.env.RESIDENT_ENC_KEY) return process.env.RESIDENT_ENC_KEY;
  if (process.env.NODE_ENV === "production")
    throw new Error("RESIDENT_ENC_KEY 환경변수가 설정되지 않았습니다. .env.local을 확인해주세요.");
  console.warn("[보안 경고] RESIDENT_ENC_KEY 미설정 — 개발 환경 기본값 사용 중. 반드시 .env.local에 설정하세요.");
  return "bangpan-pro-32byte-secret-key!!";
})();
const ALGO = "aes-256-cbc";

export function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGO, Buffer.from(ENC_KEY.slice(0,32)), iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(enc: string): string {
  const [ivHex, encHex] = enc.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv(ALGO, Buffer.from(ENC_KEY.slice(0,32)), iv);
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]);
  return decrypted.toString();
}
