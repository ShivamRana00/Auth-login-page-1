import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-dvh grid place-items-center bg-slate-50 px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">404</h1>
        <p className="mt-2 text-sm text-slate-600">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
