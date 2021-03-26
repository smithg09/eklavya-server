import { gql } from 'apollo-server-express'

const typeDefs = gql`
  scalar Date

  type Schedule {
    startTimeStamp: Date
    endTimeStamp: Date
  }

  type PROCTORING_WARNING_TYPE {
    user: User
    warning: String
  }

  type Form {
    id: ID!
    title: String
    description: String
    content: [String]
    users: [String]
    class: [String]
    division: [String]
    duration: Int
    attempts: Int
    visibility: Boolean
    view_count: Int
    results: String
    proctoredWarnings: [PROCTORING_WARNING_TYPE]
    owner: String
  }

  type User {
    _id: String
    method: String
    name: String
    email: String
    picture: String
    mobileno: Int
    division: String
    uid: Int
    semester: Int       
    department: String
    rollNo: Int
    course: String
    role: String
  }

  type Query {
    users: [User]
    result: Boolean
  }

  type userLoggedInType {
    token: String
  }
  
  type Subscription {
    userLoggedIn: userLoggedInType!
    proctoredWarning: Form
  }
`

export default typeDefs