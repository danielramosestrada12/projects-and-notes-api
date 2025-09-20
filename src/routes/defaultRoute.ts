import express from "express";

const defaultRoute = express.Router();

defaultRoute.get("/", (req, res) => {
  res.status(200).json({
    message: "Projects and Notes API",
    status: "running",
    version: "1.0.0",
  });
});

export default defaultRoute;
