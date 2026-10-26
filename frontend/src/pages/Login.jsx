
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import { loginSuccess } from "../features/auth/authSlice";
import { graphqlRequest } from "@/app";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await graphqlRequest(
        `mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            token
            user {
              id
              name
              email
              role
            }
          }
        }`,
        {
          email: email.trim().toLowerCase(),
          password,
        }
      );

      if (!data?.login?.token) {
        throw new Error("Login failed: no authentication token returned.");
      }

      dispatch(loginSuccess(data.login));
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto mt-10 max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">
          Sign in to JusticeTrack
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Criminal Justice Case Management System
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border p-3"
              placeholder="police@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border p-3"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-700 p-3 font-semibold text-white hover:bg-indigo-800 disabled:opacity-50"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
