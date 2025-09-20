import { NextFunction, Request, Response } from "express";
import { ProjectType } from "../types";
import cache from "../utils/cache";

class NoteController {
  private projects: Map<string, ProjectType> = new Map();
  private readonly LIST_CACHE_KEY = "projects:all";

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const noteId = req.params.id;
      const { text } = req.body;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: "Text is required" });
      }

      let foundProject: ProjectType | null = null;
      let noteIndex = -1;

      const cacheKey = this.LIST_CACHE_KEY;
      const cachedResult = cache.get<ProjectType[]>(cacheKey);

      console.log("Cached projects:", cachedResult);

      if (cachedResult) {
        for (const project of cachedResult) {
          if (project?.notes && Array.isArray(project.notes)) {
            noteIndex = project.notes.findIndex((n) => n.id === noteId);
            if (noteIndex !== -1) {
              foundProject = project;
              break;
            }
          }
        }
      }

      if (!foundProject || noteIndex === -1 || !foundProject.notes) {
        return res.status(404).json({ error: "Note not found" });
      }

      const note = foundProject.notes[noteIndex];
      if (note) {
        note.text = text.trim();
      }

      res.json({
        message: "Note has been updated.",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default NoteController;
