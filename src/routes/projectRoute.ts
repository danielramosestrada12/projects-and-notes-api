import express from "express";
import ProjectControlller from "../controllers/projectController";
import { validate } from "../middlewares/validation";
import { noteSchema } from "../schemas/noteSchema";
import { projectSchema } from "../schemas/projectSchema";

const projectRoute = express.Router();
const projectController = new ProjectControlller();

projectRoute.get("/", projectController.index);
projectRoute.post("/", validate(projectSchema), projectController.store);
projectRoute.get("/:id/notes", projectController.notesList);
projectRoute.post(
  "/:id/notes",
  validate(noteSchema),
  projectController.storeNote
);

export default projectRoute;
