const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
export const newSalt = () => hex(crypto.getRandomValues(new Uint8Array(16)).buffer);
/** Nama dipertahankan; kini memakai PBKDF2-SHA256 (210.000 iterasi) agar brute-force lokal jauh lebih lambat. */
export async function sha256(salt: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 210_000, hash: "SHA-256" }, key, 256));
}
