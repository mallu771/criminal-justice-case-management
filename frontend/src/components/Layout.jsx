import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";

export default function Layout({ children }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold">
            ⚖ JusticeTrack
          </Link>

          <nav className="flex items-center gap-5 text-sm">
            {user && (
              <>
                <Link to="/">Dashboard</Link>

                <Link to="/cases/new">
                  Register Case
                </Link>

                <span className="text-slate-300">
                  {user.name}
                </span>

                <button
                  onClick={() => dispatch(logout())}
                  className="rounded-lg bg-slate-700 px-3 py-2"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}