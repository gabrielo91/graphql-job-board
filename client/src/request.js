import { getAccessToken, isLoggedIn } from "./auth";
const ENDPOINT_URL = "http://localhost:9000/graphql";

async function graphQLRequest(query, variables = {}) {
  const request = {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  };

  if (isLoggedIn()) {
    request.headers["authorization"] = `Bearer ${getAccessToken()}`;
  }

  const response = await fetch(ENDPOINT_URL, request);

  const responseBody = await response.json();

  if (responseBody.errors) {
    const message = responseBody.errors
      .map((error) => error.message)
      .join("\n");
    throw new Error(message);
  }

  return responseBody.data;
}

export async function loadJobs() {
  const query = `
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
  `;
  const { jobs } = await graphQLRequest(query);

  return jobs;
}

export async function loadJobDetails(jobId) {
  const query = `
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
    `;

  const variables = { id: jobId };
  const { job } = await graphQLRequest(query, variables);
  return job;
}

export async function loadCompanyDetails(companyId) {
  const query = `
      query CompanyQuery($id:ID!){
        company(id: $id) {
          id
          name
          description
          jobs {
            id
            title
          }
        }
      }
    `;

  const variables = { id: companyId };
  const { company } = await graphQLRequest(query, variables);
  return company;
}

export async function createJob(input) {
  const mutation = `
      mutation CreateJob($input: CreateJobInput) {
        job: createJob(input: $input) {
          id
          title
          description
          company {
            name
          }
        }
      }
    `;

  const variables = { input };
  const { job } = await graphQLRequest(mutation, variables);
  return job;
}
