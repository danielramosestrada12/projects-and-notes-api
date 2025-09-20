import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import projectSchemaType from "../schemas/projectSchema";
import { NoteType, ProjectType } from "../types";
import cache from "../utils/cache";

class ProjectController {
  private projects: Map<string, ProjectType> = new Map();
  private readonly CACHE_PREFIX = "project";
  private readonly LIST_CACHE_KEY = "projects:all";
  private TTL = 300;

  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cacheKey = this.LIST_CACHE_KEY;
      const cachedResult = cache.get<ProjectType[]>(cacheKey);

      if (cachedResult) {
        console.log(`Cache HIT for projects list`);
        return res.json(cachedResult);
      }

      const projects = Array.from(this.projects.values());

      // Cache the result
      cache.set(cacheKey, projects, { ttl: this.TTL });

      res.json(projects);
    } catch (error) {
      next(error);
    }
  };

  store = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload: projectSchemaType = req.body;
      const id = uuidv4();
      const newProject: ProjectType = {
        id,
        name: payload.name,
      };

      this.projects.set(id, newProject);

      cache.set(id, newProject, {
        prefix: this.CACHE_PREFIX,
        ttl: this.TTL,
      });

      cache.del(this.LIST_CACHE_KEY);
      console.log(`Invalidated list cache due to new project: ${id}`);

      res.status(201).json(newProject);
    } catch (error) {
      next(error);
    }
  };

  notesList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId: string | undefined = req.params.id;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!projectId) {
        return res.status(422).json({ error: "Project ID is required" });
      }

      if (limit > 50) {
        return res
          .status(400)
          .json({ error: "Limit cannot exceed 50 notes per request" });
      }

      const notesCacheKey = `notes:${projectId}:limit:${limit}`;

      const cachedNotesResult = cache.get<{
        projectId: string;
        notes: NoteType[];
        total: number;
        limit: number;
      }>(notesCacheKey);

      if (cachedNotesResult) {
        console.log(`Cache HIT for notes list: ${projectId} (limit: ${limit})`);
        return res.json(cachedNotesResult);
      }

      console.log(`Cache MISS for notes list: ${projectId} (limit: ${limit})`);

      let project = cache.get<ProjectType>(projectId, {
        prefix: this.CACHE_PREFIX,
      });

      if (!project) {
        project = this.projects.get(projectId);
        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }

        cache.set(projectId, project, {
          prefix: this.CACHE_PREFIX,
          ttl: this.TTL,
        });
        console.log(`Cached project: ${projectId}`);
      }

      const notes = project.notes
        ? [...project.notes].sort((a, b) => {
            return b.createdAt.getTime() - a.createdAt.getTime();
          })
        : [];

      const notesResult = {
        projectId,
        notes: notes.slice(0, limit),
        total: notes.length,
        limit,
      };

      cache.set(notesCacheKey, notesResult, {
        ttl: this.TTL,
      });
      console.log(`Cached notes list: ${projectId} (limit: ${limit})`);

      res.json(notesResult);
    } catch (error) {
      next(error);
    }
  };

  storeNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId: string | undefined = req.params.id;

      if (!projectId) {
        return res.status(422).json({ message: "Project ID is required" });
      }

      const payload: { text: string } = req.body;

      if (!payload.text || payload.text.trim().length === 0) {
        return res.status(400).json({ message: "Note text is required" });
      }

      const project = this.projects.get(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (!project.notes) {
        project.notes = [];
      }

      const note: NoteType = {
        id: uuidv4(),
        projectId,
        text: payload.text.trim(),
        createdAt: new Date(),
      };

      project.notes.push(note);
      this.projects.set(projectId, project);

      cache.set(projectId, project, {
        prefix: this.CACHE_PREFIX,
        ttl: this.TTL,
      });

      cache.del(this.LIST_CACHE_KEY);
      console.log(`Added note to project ${projectId} and invalidated caches`);

      res.status(201).json({
        message: "Note has been added successfully.",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ProjectController;
