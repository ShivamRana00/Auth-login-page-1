import { useState, useEffect } from "react";

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export default function Avatar({ src, name, size = 40 }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  const style = { width: size, height: size };
  const showImage = src && !failed;

  if (showImage) {
    return (
      <img
        src={src}
        alt={name || "User avatar"}
        onError={() => setFailed(true)}
        referrerPolicy="no-referrer"
        className="rounded-full object-cover ring-1 ring-slate-200"
        style={style}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 font-semibold grid place-items-center ring-1 ring-slate-200"
      style={{ ...style, fontSize: Math.max(12, size / 2.6) }}
      aria-label={name || "User avatar"}
    >
      {initials(name)}
    </div>
  );
}
