const fs = require("fs");
const { ApolloServer, gql } = require("apollo-server-express");
const cors = require("cors");
const express = require("express");
const expressJwt = require("express-jwt");
const jwt = require("jsonwebtoken");
const resolvers = require("./resolvers");
const db = require("./db");

const port = 9000;
const jwtSecret = Buffer.from("Zn8Q5tyZ/G1MHltc4F/gTkVJMlrbKiZt", "base64");

const app = express();
app.use(
  cors(),
  express.json(),
  expressJwt({
    secret: jwtSecret,
    credentialsRequired: false,
  })
);

const context = ({ req }) => {
  return { user: req.user };
};

const typeDefs = gql(fs.readFileSync("./schema.graphql", { encoding: "utf8" }));
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context,
});

apolloServer.applyMiddleware({ app, path: "/graphql" });

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.users.list().find((user) => user.email === email);
  if (!(user && user.password === password)) {
    return res.sendStatus(401);
  }

  const token = jwt.sign({ sub: user.id }, jwtSecret);
  res.send({ token });
});

app.listen(port, () => console.info(`Server started on port ${port}`));
