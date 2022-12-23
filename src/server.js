import express from "express";
import listEndpoints from "express-list-endpoints";
import {
  badRequestHandler,
  genericErrorHandler,
  notFoundHandler,
  unauthorizedHandler,
} from "./errorHandlers.js";
import productsRouter from "./products/index.js";

const port = 3001;
const server = express();

server.use(express.json());

// ...............................CRUD ENDPOINTS................................
server.use("/products", productsRouter);

// ....................................ERROR HANDLERS................................
server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);
server.use(unauthorizedHandler);

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log("Server listening on port:", port);
});
