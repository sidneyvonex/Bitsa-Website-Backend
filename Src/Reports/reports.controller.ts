import { Request, Response } from "express";
import {
  getAllReportsService,
  getReportByIdService,
  getLatestReportsService,
  searchReportsService,
  createReportService,
  updateReportService,
  deleteReportService,
  getReportsByCreatorService,
  getReportStatsService,
} from "./reports.service";
import { logAuditEvent } from "../Middleware/auditLogger";

/**
 * Get all reports with optional search
 */
export const getAllReports = async (req: Request, res: Response) => {
  try {
    const { search, limit, offset } = req.query;

    const filters = {
      search: search as string | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    };

    const result = await getAllReportsService(filters);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
};

/**
 * Get latest reports
 */
export const getLatestReports = async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 10;

    const latestReports = await getLatestReportsService(limitNum);

    return res.status(200).json({
      success: true,
      data: latestReports,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch latest reports",
      error: error.message,
    });
  }
};

/**
 * Get report by ID
 */
export const getReportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const report = await getReportByIdService(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch report",
      error: error.message,
    });
  }
};

/**
 * Search reports by title
 */
export const searchReports = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'q' is required",
      });
    }

    const reports = await searchReportsService(q);

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to search reports",
      error: error.message,
    });
  }
};

/**
 * Get reports by creator (admin only)
 */
export const getReportsByCreator = async (req: Request, res: Response) => {
  try {
    const { creatorId } = req.params;

    const reports = await getReportsByCreatorService(creatorId);

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports by creator",
      error: error.message,
    });
  }
};

/**
 * Create a new report (admin only)
 */
export const createReport = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { title, content, fileUrl } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "title and content are required",
      });
    }

    const newReport = await createReportService({
      title,
      content,
      fileUrl,
      createdBy: user.id,
    });

    await logAuditEvent(
      req,
      "CREATE",
      `Created report: ${title}`,
      "Report",
      newReport.id,
      undefined,
      undefined,
      JSON.stringify(newReport)
    );

    return res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: newReport,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to create report",
      error: error.message,
    });
  }
};

/**
 * Update a report (admin only)
 */
export const updateReport = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const updateData = req.body;

    const existingReport = await getReportByIdService(id);
    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const updatedReport = await updateReportService(id, updateData);

    await logAuditEvent(
      req,
      "UPDATE",
      `Updated report: ${updatedReport?.title}`,
      "Report",
      id,
      undefined,
      JSON.stringify(existingReport),
      JSON.stringify(updatedReport)
    );

    return res.status(200).json({
      success: true,
      message: "Report updated successfully",
      data: updatedReport,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to update report",
      error: error.message,
    });
  }
};

/**
 * Delete a report (admin only)
 */
export const deleteReport = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const existingReport = await getReportByIdService(id);
    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const deletedReport = await deleteReportService(id);

    await logAuditEvent(
      req,
      "DELETE",
      `Deleted report: ${existingReport.title}`,
      "Report",
      id,
      undefined,
      JSON.stringify(existingReport),
      undefined
    );

    return res.status(200).json({
      success: true,
      message: "Report deleted successfully",
      data: deletedReport,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete report",
      error: error.message,
    });
  }
};

/**
 * Get report statistics (admin only)
 */
export const getReportStats = async (req: Request, res: Response) => {
  try {
    const stats = await getReportStatsService();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch report statistics",
      error: error.message,
    });
  }
};
