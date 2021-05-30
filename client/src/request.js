const ENDPOINT_URL = "http://localhost:9000/graphql";

export async function loadJobs() {
  const response = await fetch(ENDPOINT_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `
        {
          jobs {
            id
            title
            company {
              id
              name
            }
          }
        }
      `,
    }),
  });

  const responseBody = await response.json();
  return responseBody.data.jobs;
}

export async function loadJobDetails(jobId) {
  const response = await fetch(ENDPOINT_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `
      query JobQuery($id:ID!){
        job(id: $id) {
          id
          title
          description
          company {
            id
            name
          }
        }
      }
      `,
      variables: { id: jobId },
    }),
  });

  const responseBody = await response.json();
  return responseBody.data.job;
}
