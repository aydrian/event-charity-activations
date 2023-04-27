import { ApolloClient, InMemoryCache } from "@apollo/client";
import { split, HttpLink } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const isBrowser = typeof window !== "undefined";

const domain = "stunning-wombat-56.hasura.app/v1/graphql";

export function initApollo() {
  const httpLink = new HttpLink({
    uri: `https://${domain}`
  });

  const splitLink = isBrowser
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          );
        },
        new GraphQLWsLink(
          createClient({
            url: `ws://${domain}`,
            connectionParams: {
              headers: {
                "x-hasura-admin-secret":
                  "oyki7cQSE3UaF53UYgWrer1pH7liBDrYaRTu6v5iEFEc7jz3uabE25MvSQ7OkD7c"
              }
            }
          })
        ),
        httpLink
      )
    : httpLink;

  return new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache()
  });
}
