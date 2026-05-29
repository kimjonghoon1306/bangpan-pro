import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ENC_KEY = process.env.RESIDENT_ENC_KEY ?? "bangpan-pro-32byte-secret-key!!";
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
