import { eq, desc, asc, ilike } from "drizzle-orm";
import db from "../drizzle/db";
import { reports, TReportInsert, TReportSelect } from "../drizzle/schema";

/**
 * Get all reports with pagination
 */
export const getAllReportsService = async (filters?: {
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const { search, limit = 50, offset = 0 } = filters || {};

  const result = search
    ? await db
        .select()
        .from(reports)
        .where(ilike(reports.title, `%${search}%`))
        .orderBy(desc(reports.createdAt))
        .limit(limit)
        .offset(offset)
    : await db
        .select()
        .from(reports)
        .orderBy(desc(reports.createdAt))
        .limit(limit)
        .offset(offset);

  const total = await db.select({ count: reports.id }).from(reports);

  return {
    reports: result,
    total: total.length,
    limit,
    offset,
  };
};

/**
 * Get report by ID
 */
export const getReportByIdService = async (id: string) => {
  const result = await db.select().from(reports).where(eq(reports.id, id));
  return result[0] || null;
};

/**
 * Get latest reports
 */
export const getLatestReportsService = async (limit: number = 10) => {
  return await db
    .select()
    .from(reports)
    .orderBy(desc(reports.createdAt))
    .limit(limit);
};

/**
 * Search reports by title
 */
export const searchReportsService = async (searchTerm: string) => {
  return await db
    .select()
    .from(reports)
    .where(ilike(reports.title, `%${searchTerm}%`))
    .orderBy(desc(reports.createdAt));
};

/**
 * Create a new report
 */
export const createReportService = async (data: TReportInsert) => {
  const result = await db.insert(reports).values(data).returning();
  return result[0];
};

/**
 * Update a report
 */
export const updateReportService = async (
  id: string,
  data: Partial<TReportInsert>
) => {
  const result = await db
    .update(reports)
    .set(data)
    .where(eq(reports.id, id))
    .returning();
  return result[0] || null;
};

/**
 * Delete a report
 */
export const deleteReportService = async (id: string) => {
  const result = await db
    .delete(reports)
    .where(eq(reports.id, id))
    .returning();
  return result[0] || null;
};

/**
 * Get reports by creator
 */
export const getReportsByCreatorService = async (creatorId: string) => {
  return await db
    .select()
    .from(reports)
    .where(eq(reports.createdBy, creatorId))
    .orderBy(desc(reports.createdAt));
};

/**
 * Get report statistics
 */
export const getReportStatsService = async () => {
  const allReports = await db.select().from(reports);

  return {
    total: allReports.length,
  };
};
