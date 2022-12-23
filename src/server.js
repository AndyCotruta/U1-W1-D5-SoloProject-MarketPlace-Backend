import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import {
  badRequestHandler,
  genericErrorHandler,
  notFoundHandler,
  unauthorizedHandler,
} from "./errorHandlers.js";
import filesRouter from "./files/index.js";
import { publicFolderPath } from "./lib/fs-tools.js";
import productsRouter from "./products/index.js";

const port = 3001;
const server = express();

server.use(cors());
server.use(express.json());
server.use(express.static(publicFolderPath));

// ...............................CRUD ENDPOINTS................................
server.use("/products", productsRouter);
server.use("/product", filesRouter);

// ....................................ERROR HANDLERS................................
server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);
server.use(unauthorizedHandler);

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log("Server listening on port:", port);
});
