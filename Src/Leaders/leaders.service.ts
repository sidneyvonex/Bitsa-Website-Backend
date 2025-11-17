import { eq, desc, asc, and, or } from "drizzle-orm";
import db from "../drizzle/db";
import { leaders, TLeaderInsert, TLeaderSelect } from "../drizzle/schema";

/**
 * Get all leaders with optional filtering
 */
export const getAllLeadersService = async (filters?: {
  isCurrent?: boolean;
  academicYear?: string;
  limit?: number;
  offset?: number;
}) => {
  const { isCurrent, academicYear, limit = 50, offset = 0 } = filters || {};

  const conditions = [];

  if (isCurrent !== undefined) {
    conditions.push(eq(leaders.isCurrent, isCurrent));
  }

  if (academicYear) {
    conditions.push(eq(leaders.academicYear, academicYear));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const result = await db
    .select()
    .from(leaders)
    .where(whereClause)
    .orderBy(desc(leaders.isCurrent), desc(leaders.academicYear))
    .limit(limit)
    .offset(offset);

  const total = await db
    .select({ count: leaders.id })
    .from(leaders)
    .where(whereClause);

  return {
    leaders: result,
    total: total.length,
    limit,
    offset,
  };
};

/**
 * Get current leaders only
 */
export const getCurrentLeadersService = async () => {
  return await db
    .select()
    .from(leaders)
    .where(eq(leaders.isCurrent, true))
    .orderBy(asc(leaders.position));
};

/**
 * Get past leaders by academic year
 */
export const getPastLeadersService = async (academicYear?: string) => {
  const conditions = [eq(leaders.isCurrent, false)];

  if (academicYear) {
    conditions.push(eq(leaders.academicYear, academicYear));
  }

  return await db
    .select()
    .from(leaders)
    .where(and(...conditions))
    .orderBy(desc(leaders.academicYear), asc(leaders.position));
};

/**
 * Get leader by ID
 */
export const getLeaderByIdService = async (id: string) => {
  const result = await db.select().from(leaders).where(eq(leaders.id, id));
  return result[0] || null;
};

/**
 * Get all unique academic years
 */
export const getAcademicYearsService = async () => {
  const result = await db
    .selectDistinct({ academicYear: leaders.academicYear })
    .from(leaders)
    .orderBy(desc(leaders.academicYear));

  return result.map((r) => r.academicYear);
};

/**
 * Create a new leader
 */
export const createLeaderService = async (data: TLeaderInsert) => {
  const result = await db.insert(leaders).values(data).returning();
  return result[0];
};

/**
 * Update a leader
 */
export const updateLeaderService = async (
  id: string,
  data: Partial<TLeaderInsert>
) => {
  const result = await db
    .update(leaders)
    .set(data)
    .where(eq(leaders.id, id))
    .returning();
  return result[0] || null;
};

/**
 * Delete a leader
 */
export const deleteLeaderService = async (id: string) => {
  const result = await db
    .delete(leaders)
    .where(eq(leaders.id, id))
    .returning();
  return result[0] || null;
};

/**
 * Set all leaders as past leaders (mark as not current)
 */
export const markAllAsPastService = async () => {
  await db.update(leaders).set({ isCurrent: false });
};

/**
 * Set specific leaders as current (by academic year)
 */
export const setCurrentLeadersByYearService = async (academicYear: string) => {
  // First, mark all as past
  await markAllAsPastService();

  // Then mark the specified year as current
  const result = await db
    .update(leaders)
    .set({ isCurrent: true })
    .where(eq(leaders.academicYear, academicYear))
    .returning();

  return result;
};

/**
 * Get leader statistics
 */
export const getLeaderStatsService = async () => {
  const allLeaders = await db.select().from(leaders);

  const current = allLeaders.filter((l) => l.isCurrent).length;
  const past = allLeaders.filter((l) => !l.isCurrent).length;
  const totalYears = new Set(allLeaders.map((l) => l.academicYear)).size;

  return {
    total: allLeaders.length,
    current,
    past,
    totalYears,
  };
};
