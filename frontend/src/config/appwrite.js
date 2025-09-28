import { Client, Account } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1') // Your Appwrite Endpoint
    .setProject('688dd4cb003ab628f7f3'); // Your project ID

const account = new Account(client);

export { client, account };
export default client;
