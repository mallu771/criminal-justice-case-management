import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import { graphqlRequest } from "@/app";

export default function Dashboard() {
  // Read the authentication token from Redux.
  const token = useSelector((state) => state.auth.token);

  // Store cases and request state.
  const [cases, setCases] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch cases from the GraphQL API.
  useEffect(() => {
    let cancelled = false;

    async function loadCases() {
      setLoading(true);
      setError("");

      try {
        const data = await graphqlRequest(
          `query {
            cases(page: 1, limit: 50) {
              id
              caseNumber
              title
              policeStation
              status
              createdAt
            }
          }`,
          {},
          token
        );

        if (!cancelled) {
          setCases(data.cases ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load cases.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCases();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Calculate dashboard statistics from actual API data.
  const activeCases = cases.filter(
    (item) =>
      !["CLOSED", "ACQUITTED", "CONVICTED"].includes(item.status)
  ).length;

  const investigating = cases.filter(
    (item) => item.status === "UNDER_INVESTIGATION"
  ).length;

  const finalOutcomes = cases.filter(
    (item) =>
      ["ACQUITTED", "CONVICTED"].includes(item.status)
  ).length;

  const formatStatus = (status = "") =>
    status.replaceAll("_", " ");

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-indigo-700">
            CASE MANAGEMENT
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Overview of case activity and progress.
          </p>
        </div>

        <Link
          to="/cases/new"
          className="rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800"
        >
          + Register Case
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Cases"
          value={loading ? "..." : cases.length}
          description="Cases loaded from API"
        />

        <StatCard
          title="Active Cases"
          value={loading ? "..." : activeCases}
          description="Not yet finalized"
        />

        <StatCard
          title="Under Investigation"
          value={loading ? "..." : investigating}
          description="Investigation stage"
        />

        <StatCard
          title="Final Outcomes"
          value={loading ? "..." : finalOutcomes}
          description="Acquittals or convictions"
        />
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="font-bold">Recent Cases</h2>

          <Link
            to="/cases/new"
            className="text-sm font-medium text-indigo-700"
          >
            Create case
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">Case Number</th>
                <th className="p-4">Title</th>
                <th className="p-4">Police Station</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-slate-500">
                    Loading cases...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-slate-500">
                    No cases found.
                  </td>
                </tr>
              ) : (
                cases.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-4 font-medium">
                      {item.caseNumber}
                    </td>

                    <td className="p-4">{item.title}</td>

                    <td className="p-4">
                      {item.policeStation || "—"}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-800">
                        {formatStatus(item.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}