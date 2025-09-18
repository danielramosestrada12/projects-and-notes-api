import express from "express";

const defaultRoute = express.Router();

defaultRoute.get("/", (req, res) => {
  res.json({ message: "Welcome to the Projects and Notes API!" });
});

export default defaultRoute;
