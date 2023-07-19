import dataProvider, { GraphQLClient } from "@refinedev/strapi-graphql";


const production = false;
let API_URL = "http://192.168.2.67:8483/graphql/";
if(production){
  API_URL = "";
}

export const client = new GraphQLClient(API_URL);
export const gqlDataProvider = dataProvider(client);

if (localStorage.getItem("token")) {
  client.setHeader("Authorization", `Bearer ${localStorage.getItem("token")}`);
}
