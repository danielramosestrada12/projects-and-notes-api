import express from "express";
import defaultRoute from "./defaultRoute";

const routes = express.Router();

routes.use("/", defaultRoute);

export default routes;
