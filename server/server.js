const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schemas');
const path = require('path');
const db = require('./config/connection');
const { authMiddleware } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Create Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});

// Connect Apollo Server to Express app
server.applyMiddleware({ app });

// Add middleware for parsing JSON and URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve client-side assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  // Serve the index.html file for all non-API requests
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Connect to database and start server
db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}`);
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
