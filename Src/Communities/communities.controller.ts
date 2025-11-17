import { Request, Response } from "express";
import {
  getAllCommunitiesService,
  getCommunityByIdService,
  searchCommunitiesService,
  createCommunityService,
  updateCommunityService,
  deleteCommunityService,
  getCommunityStatsService,
} from "./communities.service";
import { logAuditEvent } from "../Middleware/auditLogger";

/**
 * Get all communities with optional search
 */
export const getAllCommunities = async (req: Request, res: Response) => {
  try {
    const { search, limit, offset } = req.query;

    const filters = {
      search: search as string | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    };

    const result = await getAllCommunitiesService(filters);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch communities",
      error: error.message,
    });
  }
};

/**
 * Get community by ID
 */
export const getCommunityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const community = await getCommunityByIdService(id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: community,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch community",
      error: error.message,
    });
  }
};

/**
 * Search communities by name
 */
export const searchCommunities = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'q' is required",
      });
    }

    const communities = await searchCommunitiesService(q);

    return res.status(200).json({
      success: true,
      data: communities,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to search communities",
      error: error.message,
    });
  }
};

/**
 * Create a new community (admin only)
 */
export const createCommunity = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { name, description, whatsappLink } = req.body;

    if (!name || !description || !whatsappLink) {
      return res.status(400).json({
        success: false,
        message: "name, description, and whatsappLink are required",
      });
    }

    const newCommunity = await createCommunityService({
      name,
      description,
      whatsappLink,
    });

    await logAuditEvent(
      req,
      "CREATE",
      `Created community: ${name}`,
      "Community",
      newCommunity.id,
      undefined,
      undefined,
      JSON.stringify(newCommunity)
    );

    return res.status(201).json({
      success: true,
      message: "Community created successfully",
      data: newCommunity,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to create community",
      error: error.message,
    });
  }
};

/**
 * Update a community (admin only)
 */
export const updateCommunity = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const updateData = req.body;

    const existingCommunity = await getCommunityByIdService(id);
    if (!existingCommunity) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    const updatedCommunity = await updateCommunityService(id, updateData);

    await logAuditEvent(
      req,
      "UPDATE",
      `Updated community: ${updatedCommunity?.name}`,
      "Community",
      id,
      undefined,
      JSON.stringify(existingCommunity),
      JSON.stringify(updatedCommunity)
    );

    return res.status(200).json({
      success: true,
      message: "Community updated successfully",
      data: updatedCommunity,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to update community",
      error: error.message,
    });
  }
};

/**
 * Delete a community (admin only)
 */
export const deleteCommunity = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const existingCommunity = await getCommunityByIdService(id);
    if (!existingCommunity) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    const deletedCommunity = await deleteCommunityService(id);

    await logAuditEvent(
      req,
      "DELETE",
      `Deleted community: ${existingCommunity.name}`,
      "Community",
      id,
      undefined,
      JSON.stringify(existingCommunity),
      undefined
    );

    return res.status(200).json({
      success: true,
      message: "Community deleted successfully",
      data: deletedCommunity,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete community",
      error: error.message,
    });
  }
};

/**
 * Get community statistics (admin only)
 */
export const getCommunityStats = async (req: Request, res: Response) => {
  try {
    const stats = await getCommunityStatsService();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch community statistics",
      error: error.message,
    });
  }
};
