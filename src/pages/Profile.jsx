import { useState } from "react";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Avatar from "../components/Avatar.jsx";
import Spinner from "../components/Spinner.jsx";

export default function Profile() {
  const { user, signOutUser } = useAuth();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    if (pending) return;
    setPending(true);
    try {
      await signOutUser();
      toast.success("Signed out", { id: "auth-signed-out" });
    } catch {
      toast.error("Couldn't sign out. Try again.");
    } finally {
      setPending(false);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-dvh grid place-items-center bg-slate-50 px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-8">
        <div className="flex flex-col items-center text-center">
          <Avatar src={user.photoURL} name={user.displayName || user.email} size={80} />
          <h1 className="mt-4 text-lg font-semibold text-slate-900">
            {user.displayName || "Signed in"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 break-all">{user.email}</p>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={pending}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-rose-600 ring-1 ring-rose-200 shadow-sm transition hover:bg-rose-50 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? <Spinner /> : <LogOut className="h-4 w-4" />}
          <span>{pending ? "Signing out…" : "Sign out"}</span>
        </button>
      </div>
    </div>
  );
}
