import express from "express";
import NoteController from "../controllers/noteController";

const noteRoute = express.Router();
const noteController = new NoteController();

noteRoute.patch("/:id", noteController.update);

export default noteRoute;
