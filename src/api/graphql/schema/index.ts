import { buildSchema } from 'graphql';

export const graphQlSchema = buildSchema(`
        scalar Date

        enum Methods {
          local
          OAuth2
        }

        type OAuth2Struct {
          Id: String
          picture: String
        }

        type User {
            _id: ID!
            method: Methods!
            OAuth2: OAuth2Struct
            name: String
            email: String!
            password: String!
            salt: String!
            role: String!
            lastLogin: Date
            createdAt: Date
            updatedAt: Date
        }

        type RootQuery {
          users: [User]
        }

        schema {
            query: RootQuery
        }
  `);
