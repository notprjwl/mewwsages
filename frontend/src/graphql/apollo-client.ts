import {ApolloClient, HttpLink, InMemoryCache} from "@apollo/client"


const httpLink = new HttpLink({
    uri: "http://localhost:4000/graphql",   // every endpoints store in graphql
    credentials: "include",
});

// new apollo client 
export const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(), // it provides an option to store in the cache
})