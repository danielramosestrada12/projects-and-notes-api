import * as z from "zod";
export const noteSchema = z.object({
  text: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(255, "Name must be less than 255 characters")
    .trim(),
});

type noteSchemaType = z.infer<typeof noteSchema>;
export default noteSchemaType;
