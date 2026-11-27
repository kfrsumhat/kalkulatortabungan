import { Fragment } from "react";
/** Markdown mini: **tebal** dan baris baru. Tidak memakai innerHTML (aman dari injeksi). */
export function Md({ text }: { text: string }) {
  return <>{text.split("\n").map((ln, i) => (
    <Fragment key={i}>{i > 0 && <br />}{ln.split("**").map((p, j) => (j % 2 ? <b key={j}>{p}</b> : <Fragment key={j}>{p}</Fragment>))}</Fragment>
  ))}</>;
}
