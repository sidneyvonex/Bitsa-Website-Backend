import { Request, Response } from "express";
import {
  getAllLeadersService,
  getCurrentLeadersService,
  getPastLeadersService,
  getLeaderByIdService,
  getAcademicYearsService,
  createLeaderService,
  updateLeaderService,
  deleteLeaderService,
  setCurrentLeadersByYearService,
  getLeaderStatsService,
} from "./leaders.service";
import { logAuditEvent } from "../Middleware/auditLogger";

/**
 * Get all leaders with optional filters
 */
export const getAllLeaders = async (req: Request, res: Response) => {
  try {
    const { isCurrent, academicYear, limit, offset } = req.query;

    const filters = {
      isCurrent: isCurrent === "true" ? true : isCurrent === "false" ? false : undefined,
      academicYear: academicYear as string | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    };

    const result = await getAllLeadersService(filters);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leaders",
      error: error.message,
    });
  }
};

/**
 * Get current leaders only
 */
export const getCurrentLeaders = async (req: Request, res: Response) => {
  try {
    const currentLeaders = await getCurrentLeadersService();

    return res.status(200).json({
      success: true,
      data: currentLeaders,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch current leaders",
      error: error.message,
    });
  }
};

/**
 * Get past leaders (optionally filtered by year)
 */
export const getPastLeaders = async (req: Request, res: Response) => {
  try {
    const { academicYear } = req.query;

    const pastLeaders = await getPastLeadersService(academicYear as string);

    return res.status(200).json({
      success: true,
      data: pastLeaders,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch past leaders",
      error: error.message,
    });
  }
};

/**
 * Get leader by ID
 */
export const getLeaderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const leader = await getLeaderByIdService(id);

    if (!leader) {
      return res.status(404).json({
        success: false,
        message: "Leader not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: leader,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leader",
      error: error.message,
    });
  }
};

/**
 * Get all academic years
 */
export const getAcademicYears = async (req: Request, res: Response) => {
  try {
    const years = await getAcademicYearsService();

    return res.status(200).json({
      success: true,
      data: years,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch academic years",
      error: error.message,
    });
  }
};

/**
 * Create a new leader (admin only)
 */
export const createLeader = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { fullName, position, academicYear, profilePicture, email, phone, isCurrent } = req.body;

    if (!fullName || !position || !academicYear) {
      return res.status(400).json({
        success: false,
        message: "fullName, position, and academicYear are required",
      });
    }

    const newLeader = await createLeaderService({
      fullName,
      position,
      academicYear,
      profilePicture,
      email,
      phone,
      isCurrent: isCurrent || false,
    });

    await logAuditEvent(
      req,
      "CREATE",
      `Created leader: ${fullName} (${position})`,
      "Leader",
      newLeader.id,
      undefined,
      undefined,
      JSON.stringify(newLeader)
    );

    return res.status(201).json({
      success: true,
      message: "Leader created successfully",
      data: newLeader,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to create leader",
      error: error.message,
    });
  }
};

/**
 * Update a leader (admin only)
 */
export const updateLeader = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const updateData = req.body;

    const existingLeader = await getLeaderByIdService(id);
    if (!existingLeader) {
      return res.status(404).json({
        success: false,
        message: "Leader not found",
      });
    }

    const updatedLeader = await updateLeaderService(id, updateData);

    await logAuditEvent(
      req,
      "UPDATE",
      `Updated leader: ${updatedLeader?.fullName}`,
      "Leader",
      id,
      undefined,
      JSON.stringify(existingLeader),
      JSON.stringify(updatedLeader)
    );

    return res.status(200).json({
      success: true,
      message: "Leader updated successfully",
      data: updatedLeader,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to update leader",
      error: error.message,
    });
  }
};

/**
 * Delete a leader (admin only)
 */
export const deleteLeader = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const existingLeader = await getLeaderByIdService(id);
    if (!existingLeader) {
      return res.status(404).json({
        success: false,
        message: "Leader not found",
      });
    }

    const deletedLeader = await deleteLeaderService(id);

    await logAuditEvent(
      req,
      "DELETE",
      `Deleted leader: ${existingLeader.fullName}`,
      "Leader",
      id,
      undefined,
      JSON.stringify(existingLeader),
      undefined
    );

    return res.status(200).json({
      success: true,
      message: "Leader deleted successfully",
      data: deletedLeader,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete leader",
      error: error.message,
    });
  }
};

/**
 * Set current leaders by academic year (admin only)
 */
export const setCurrentLeadersByYear = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { academicYear } = req.body;

    if (!academicYear) {
      return res.status(400).json({
        success: false,
        message: "academicYear is required",
      });
    }

    const updatedLeaders = await setCurrentLeadersByYearService(academicYear);

    await logAuditEvent(
      req,
      "UPDATE",
      `Set current leaders to academic year: ${academicYear}`,
      "Leader",
      academicYear,
      undefined,
      undefined,
      JSON.stringify({ academicYear, count: updatedLeaders.length })
    );

    return res.status(200).json({
      success: true,
      message: `Current leaders set to ${academicYear}`,
      data: updatedLeaders,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to set current leaders",
      error: error.message,
    });
  }
};

/**
 * Get leader statistics (admin only)
 */
export const getLeaderStats = async (req: Request, res: Response) => {
  try {
    const stats = await getLeaderStatsService();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leader statistics",
      error: error.message,
    });
  }
};
