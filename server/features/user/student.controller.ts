import { Request, Response, NextFunction } from "express";
import { StudentService } from "./student.service.ts";
import { StudentAdapter } from "./student.adapter.ts";
import {
  studentValidationSchema,
  addressValidationSchema,
} from "./student.validation";
import { OnboardingStage } from "./student.model";
import logger from "../../utils/logger";

export class StudentWebController {
  // ==========================================
  // 1. ADMIN DASHBOARD: CREATE LEARNER
  // ==========================================
  static async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      logger.info("HTTP Request: Admin initiating student creation profile");

      // 🛡️ Validate payload using Zod before touching the service layer
      const validatedData = studentValidationSchema.parse(req.body);

      const newStudent = await StudentService.createStudent(validatedData);
      const safeResponse = StudentAdapter.toClient(newStudent);

      return res.status(201).json({
        success: true,
        message: "Student profile initialized successfully.",
        data: safeResponse,
      });
    } catch (error) {
      next(error); // Passes validation or ApiErrors to the global Express error handler
    }
  }

  // ==========================================
  // 2. ADMIN DASHBOARD: GET BY DATABASE ID
  // ==========================================
  static async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      logger.info(`HTTP Request: Fetching student payload for ID: ${id}`);

      const idStr = String(id || "");

      if (!idStr) {
        logger.error("Student Search Blocked: Query parameters missing values");
        return res.status(400).json({
          success: false,
          message: "Student ID must be provided in the query string.",
        });
      }

      const student = await StudentService.getStudentById(idStr);
      const safeResponse = StudentAdapter.toClient(student);

      return res.status(200).json({
        success: true,
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // 3. ADMIN DASHBOARD: UPDATE PROFILE
  // ==========================================
  static async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      logger.info(
        `HTTP Request: Admin updating student configuration for ID: ${id}`,
      );

      const idStr = String(id || "");

      if (!idStr) {
        logger.error("Student Update Blocked: Query parameters missing values");
        return res.status(400).json({
          success: false,
          message: "Student ID must be provided in the query string.",
        });
      }

      // Partial validation layer check
      const validatedBody = studentValidationSchema.partial().parse(req.body);

      const updatedStudent = await StudentService.updateStudent(
        idStr,
        validatedBody,
      );
      const safeResponse = StudentAdapter.toClient(updatedStudent);

      return res.status(200).json({
        success: true,
        message: "Student file updated successfully.",
        data: safeResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // 4. ADMIN DASHBOARD: ARCHIVE/DELETE
  // ==========================================
  static async delete(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { id } = req.params;
      logger.warn(
        `HTTP Request: Admin executing soft-delete sequence on ID: ${id}`,
      );

      const idStr = String(id || "");

      if (!idStr) {
        logger.error("Student Delete Blocked: Query parameters missing values");
        return res.status(400).json({
          success: false,
          message: "Student ID must be provided in the query string.",
        });
      }

      await StudentService.removeStudent(idStr);

      return res.status(200).json({
        success: true,
        message: "Student profile safely archived and deactivated.",
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // 5. ADMIN DASHBOARD: GET BY SCHOOL BRANCH
  // ==========================================
  static async getByBranch(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { school, branch } = req.query;
      logger.info(
        `HTTP Request: Extracting operational list for School: ${school}, Branch: ${branch}`,
      );

      const students = await StudentService.getStudentsByBranch(
        school as string,
        branch as string,
      );
      const safeList = students.map(StudentAdapter.toClient);

      return res.status(200).json({
        success: true,
        count: safeList.length,
        data: safeList,
      });
    } catch (error) {
      next(error);
    }
  }
}

// ============================================================================
// 🤖 WHATSAPP BOT SPECIFIC WEBHOOK CONTROLLER
// ============================================================================
export class StudentBotController {
  /**
   * Executed every time a user texts the WhatsApp number.
   * Hands back an ultra-light context block to let the Bot Engine determine the next reply text.
   */
  static async getBotContext(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { whatsappNo } = req.body; // Incoming WhatsApp phone payload identifier
      logger.info(
        `Webhook Core: Fetching bot state profile context for phone: ${whatsappNo}`,
      );

      let student;
      try {
        student = await StudentService.getStudentByWhatsappNo(whatsappNo);
      } catch (error: any) {
        // If student does not exist (404), initialize a brand new cold prospect automatically
        if (error.statusCode === 404) {
          logger.info(
            `Webhook Core: Unrecognized number ${whatsappNo}. Initializing cold lead profile.`,
          );
          student = await StudentService.createStudent({
            whatsappNo,
            onboarding: { stage: OnboardingStage.NEW },
          });
        } else {
          throw error;
        }
      }

      // Convert data into lightweight data structures optimized explicitly for chat parsing loops
      const botContext = StudentAdapter.toBotContext(student);

      return res.status(200).json({
        success: true,
        context: botContext,
      });
    } catch (error) {
      next(error);
    }
  }
}
