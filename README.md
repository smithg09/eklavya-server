<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="#">
    <img src="nodetype.png" alt="Logo" width="250" height="100">
  </a>
  
  <h3 align="center">Eklavya</h3>

  <p align="center">
    Eklavya Server is a REST API built upon Nx Workspace using Node-Typescript/Express/MongoDB with JWT support.
    <br />
    This project is hosted on heroku at <a href="https://eklavya-server.herokuapp.com/API/documentation" target="_blank"> <b>eklavya-server.herokuapp.com/</b> </a>.
    <br />
    <br />
    <a href="https://eklavya-server.herokuapp.com/">📝 API Documentation</a>
  </p>
</p>

## Tech Stack


* [Node.js](https://nodejs.org/en/), [TypeScript](https://www.typescriptlang.org/) , [JWT](https://jwt.io/), [Prettier](https://prettier.io/)— core platforms.
* [GraphQL](https://graphql.org/), [express-graphql](https://github.com/graphql/express-graphql)- schema and Graphql API endpoint.
* [MongoDB](https://www.mongodb.com/) — data access and db automation.
* [Jest](https://jestjs.io/) - unit and snapshot testing.

<!--  Generate Documentation from postman json  -->
<!--  docgen build -i input-postman-collection.json -o ~/Downloads/index.html  -->

## Development

We use `node` version `10.15.0`

```
nvm install 10.15.0
```

```
nvm use 10.15.0
```

The first time, you will need to run

```
npm install
```

Then just start the server with

```
nx serve
```
It uses nodemon for livereloading ✌️

## Production

We make use of  `nx cli` to build with custom production configuration.

```
nx build --configuration=production
```
<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.
