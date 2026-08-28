import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
// import logger from "../utils/logger.js";

// import { AnyZodObject, ZodError } from "zod";
import { type ZodObject, fromJSONSchema, ZodError } from "zod";

export const validate =
  (schema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 🌟 FIX: Parse req.body directly instead of wrapping it!
      const validatedBody = await schema.parseAsync(req.body);

      // Optional: Assign it back to req.body so mutated data (like trimmed strings) is preserved
      req.body = validatedBody;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join("."),
          message: "all fields are required",
          status: "false",
        }));
        logger.error(
          `Error caught by Zod middleware because there are missing fields`,
        );

        return res.status(400).json({
          status: "fail",
          errors: formattedErrors,
        });
      }
      next(error);
    }
  };
