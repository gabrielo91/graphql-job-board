import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "apollo-boost";
import gql from "graphql-tag";
import { getAccessToken, isLoggedIn } from "./auth";

const ENDPOINT_URL = "http://localhost:9000/graphql";
const jobQuery = gql`
  query JobQuery($id: ID!) {
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

const authLink = new ApolloLink((operation, forward) => {
  if (isLoggedIn()) {
    operation.setContext({
      headers: {
        authorization: `Bearer ${getAccessToken()}`,
      },
    });
  }

  return forward(operation);
});

const client = new ApolloClient({
  link: ApolloLink.from([authLink, new HttpLink({ uri: ENDPOINT_URL })]),
  cache: new InMemoryCache(),
});

export async function loadJobs() {
  const query = gql`
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

  const {
    data: { jobs },
  } = await client.query({ query, fetchPolicy: "no-cache" });

  return jobs;
}

export async function loadJobDetails(jobId) {
  const variables = { id: jobId };
  const {
    data: { job },
  } = await client.query({ query: jobQuery, variables });

  return job;
}

export async function loadCompanyDetails(companyId) {
  const query = gql`
    query CompanyQuery($id: ID!) {
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
  const {
    data: { company },
  } = await client.query({ query, variables });
  return company;
}

export async function createJob(input) {
  const mutation = gql`
    mutation CreateJob($input: CreateJobInput) {
      job: createJob(input: $input) {
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

  const {
    data: { job },
  } = await client.mutate({
    mutation,
    variables: { input },
    update: (cache, { data }) => {
      // data is part of the mutation result
      cache.writeQuery({
        query: jobQuery,
        variables: { id: data.job.id },
        data,
      });
    },
  });
  return job;
}
