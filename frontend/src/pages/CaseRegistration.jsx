
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "../components/Layout";
import { graphqlRequest } from "@/app";

const initialForm = {
  title: "",
  description: "",
  policeStation: "",
  incidentDate: "",
};

export default function CaseRegistration() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // IMPORTANT: Hooks must be at the component's top level.
  const token = useSelector((state) => state.auth.token);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Your session is missing. Please log in again.");
      return;
    }

    setSubmitting(true);

    try {
      const data = await graphqlRequest(
        `mutation CreateCase(
          $title: String!,
          $description: String!,
          $policeStation: String!,
          $incidentDate: String
        ) {
          createCase(
            title: $title,
            description: $description,
            policeStation: $policeStation,
            incidentDate: $incidentDate
          ) {
            id
            caseNumber
            title
            status
          }
        }`,
        {
          title: form.title.trim(),
          description: form.description.trim(),
          policeStation: form.policeStation.trim(),
          incidentDate: form.incidentDate || null,
        },
        token
      );

      if (!data?.createCase) {
        throw new Error("The server did not return the created case.");
      }

      // Do not clear the token or dispatch logout here.
      alert(`Case created: ${data.createCase.caseNumber}`);

      setForm(initialForm);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to register the case.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm text-indigo-700">
          ← Back to Dashboard
        </Link>

        <h1 className="mt-4 text-3xl font-bold">
          Register New Case
        </h1>

        <p className="mt-2 text-slate-500">
          Enter fictional information for the initial complaint.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5 rounded-xl border bg-white p-6"
        >
          <div>
            <label className="text-sm font-medium">
              Case Title *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              maxLength={200}
              className="mt-2 w-full rounded-lg border p-3"
              placeholder="Enter case title"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Complaint Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              maxLength={10000}
              rows={5}
              className="mt-2 w-full rounded-lg border p-3"
              placeholder="Describe the fictional complaint"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Police Station *
            </label>
            <input
              name="policeStation"
              value={form.policeStation}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-lg border p-3"
              placeholder="Enter police station"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Incident Date
            </label>
            <input
              type="date"
              name="incidentDate"
              value={form.incidentDate}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border p-3"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              {submitting ? "Registering..." : "Register Case"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-lg border px-5 py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
