const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
export const newSalt = () => hex(crypto.getRandomValues(new Uint8Array(16)).buffer);
export async function sha256(salt: string, secret: string) {
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + ":" + secret)));
}
