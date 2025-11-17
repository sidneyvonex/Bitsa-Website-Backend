import { Request, Response } from "express";
import {
  getAllPartnersService,
  getPartnerByIdService,
  searchPartnersService,
  createPartnerService,
  updatePartnerService,
  deletePartnerService,
  getPartnerStatsService,
} from "./partners.service";
import { logAuditEvent } from "../Middleware/auditLogger";

/**
 * Get all partners with optional search
 */
export const getAllPartners = async (req: Request, res: Response) => {
  try {
    const { search, limit, offset } = req.query;

    const filters = {
      search: search as string | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    };

    const result = await getAllPartnersService(filters);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch partners",
      error: error.message,
    });
  }
};

/**
 * Get partner by ID
 */
export const getPartnerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const partner = await getPartnerByIdService(id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: partner,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch partner",
      error: error.message,
    });
  }
};

/**
 * Search partners by name
 */
export const searchPartners = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'q' is required",
      });
    }

    const partners = await searchPartnersService(q);

    return res.status(200).json({
      success: true,
      data: partners,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to search partners",
      error: error.message,
    });
  }
};

/**
 * Create a new partner (admin only)
 */
export const createPartner = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { name, logo, website } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "name is required",
      });
    }

    const newPartner = await createPartnerService({
      name,
      logo,
      website,
    });

    await logAuditEvent(
      req,
      "CREATE",
      `Created partner: ${name}`,
      "Partner",
      newPartner.id,
      undefined,
      undefined,
      JSON.stringify(newPartner)
    );

    return res.status(201).json({
      success: true,
      message: "Partner created successfully",
      data: newPartner,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to create partner",
      error: error.message,
    });
  }
};

/**
 * Update a partner (admin only)
 */
export const updatePartner = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const updateData = req.body;

    const existingPartner = await getPartnerByIdService(id);
    if (!existingPartner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    const updatedPartner = await updatePartnerService(id, updateData);

    await logAuditEvent(
      req,
      "UPDATE",
      `Updated partner: ${updatedPartner?.name}`,
      "Partner",
      id,
      undefined,
      JSON.stringify(existingPartner),
      JSON.stringify(updatedPartner)
    );

    return res.status(200).json({
      success: true,
      message: "Partner updated successfully",
      data: updatedPartner,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to update partner",
      error: error.message,
    });
  }
};

/**
 * Delete a partner (admin only)
 */
export const deletePartner = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const existingPartner = await getPartnerByIdService(id);
    if (!existingPartner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    const deletedPartner = await deletePartnerService(id);

    await logAuditEvent(
      req,
      "DELETE",
      `Deleted partner: ${existingPartner.name}`,
      "Partner",
      id,
      undefined,
      JSON.stringify(existingPartner),
      undefined
    );

    return res.status(200).json({
      success: true,
      message: "Partner deleted successfully",
      data: deletedPartner,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete partner",
      error: error.message,
    });
  }
};

/**
 * Get partner statistics (admin only)
 */
export const getPartnerStats = async (req: Request, res: Response) => {
  try {
    const stats = await getPartnerStatsService();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch partner statistics",
      error: error.message,
    });
  }
};
