
const API_URL =
  import.meta.env.VITE_GRAPHQL_URL ||
  `${import.meta.env.VITE_API_URL}/graphql`;

export async function graphqlRequest(
  query,
  variables = {},
  token = null
) {
  const response = await fetch(API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
    },

    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = await response.json();

  if (!response.ok || result.errors?.length) {
    throw new Error(
      result.errors?.[0]?.message || "Request failed"
    );
  }

  return result.data;
}
