const readURL = (f: Blob) => new Promise<string>((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = () => no(new Error("Gagal membaca file.")); r.readAsDataURL(f); });

/** Perkecil gambar upload (logo/sampul) ke data URL ringan. SVG dipakai apa adanya (maks 100 KB). */
export async function imageToDataUrl(f: File, o: { maxW: number; maxH: number; type: "image/jpeg" | "image/png"; q?: number }): Promise<string> {
  if (!/^image\/(png|jpe?g|webp|svg\+xml)$/.test(f.type)) throw new Error("Format harus PNG, JPG, WebP, atau SVG.");
  if (f.size > 8_000_000) throw new Error("Ukuran file maksimal 8 MB.");
  if (f.type === "image/svg+xml") { if (f.size > 100_000) throw new Error("SVG maksimal 100 KB."); return readURL(f); }
  const bmp = await createImageBitmap(f);
  const s = Math.min(1, o.maxW / bmp.width, o.maxH / bmp.height);
  const cv = document.createElement("canvas");
  cv.width = Math.max(1, Math.round(bmp.width * s)); cv.height = Math.max(1, Math.round(bmp.height * s));
  const ctx = cv.getContext("2d");
  if (!ctx) throw new Error("Browser tidak mendukung canvas.");
  ctx.drawImage(bmp, 0, 0, cv.width, cv.height); bmp.close();
  return cv.toDataURL(o.type, o.q);
}
