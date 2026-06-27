export default function Spinner({ className = "" }) {
  return (
    <div
      className={
        "h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 " +
        className
      }
      role="status"
      aria-label="Loading"
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-dvh grid place-items-center bg-slate-50">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
