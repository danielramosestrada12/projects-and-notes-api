import express from "express";
import defaultRoute from "./defaultRoute";
import noteRoute from "./noteRoute";
import projectRoute from "./projectRoute";

const routes = express.Router();

routes.use("/", defaultRoute);
routes.use("/projects", projectRoute);
routes.use("/notes", noteRoute);

export default routes;
