import * as z from "zod";
export const projectSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
    .trim(),
});

type projectSchemaType = z.infer<typeof projectSchema>;
export default projectSchemaType;
