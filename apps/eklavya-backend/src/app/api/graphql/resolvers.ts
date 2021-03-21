import { pubsub } from './pubsub'
const resolvers = {
  Query: {
    result() {
      pubsub.publish('PROCTORING_UPDATE', { proctoredWarning: true});
      return true
    }
  },
  Subscription: {
    userLoggedIn: {
      subscribe: () => pubsub.asyncIterator(['LOGIN_UPDATE']),
    },
    proctoredWarning: {
      subscribe: () => pubsub.asyncIterator(['PROCTORING_UPDATE']),
    },
  }
};

export default resolvers;