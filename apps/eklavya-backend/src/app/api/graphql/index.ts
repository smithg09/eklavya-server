import { ApolloServer } from 'apollo-server-express';
import typeDefs from './schema'
import resolvers from './resolvers'

const server = new ApolloServer({
    typeDefs,
    resolvers,
    subscriptions: {
        onConnect: () => {
            console.log('Client connected');
        },
        onDisconnect: () => {
            console.log('Client disconnected')
        },
    },
    playground: true
});

export default server 