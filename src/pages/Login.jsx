import { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import GoogleButton from "../components/GoogleButton.jsx";
import { FullPageSpinner } from "../components/Spinner.jsx";

export default function Login() {
  const { user, loading, error, clearError } = useAuth();
  const toastedRef = useRef(false);

  // Clear stale errors on mount.
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Toast on successful sign-in (guarded so it fires once per session transition).
  useEffect(() => {
    if (user && !toastedRef.current) {
      toastedRef.current = true;
      toast.success(
        "Signed in as " + (user.displayName || user.email),
        { id: "auth-signed-in" },
      );
    }
  }, [user]);

  // Surface auth errors via toast alongside inline text.
  useEffect(() => {
    if (error) toast.error(error, { id: "auth-error" });
  }, [error]);

  if (loading) return <FullPageSpinner />;
  if (user) return <Navigate to="/profile" replace />;

  return (
    <div className="min-h-dvh grid place-items-center bg-slate-50 px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-600">
            Sign in with your Google account to continue.
          </p>
        </div>

        <GoogleButton />

        {error && (
          <p
            role="alert"
            className="mt-4 text-center text-sm text-rose-600"
          >
            {error}
          </p>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          We never post anything to your account.
        </p>
      </div>
    </div>
  );
}
