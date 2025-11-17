import { eq, desc, asc, ilike } from "drizzle-orm";
import db from "../drizzle/db";
import { communities, TCommunityInsert, TCommunitySelect } from "../drizzle/schema";

/**
 * Get all communities with pagination
 */
export const getAllCommunitiesService = async (filters?: {
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const { search, limit = 50, offset = 0 } = filters || {};

  const result = search
    ? await db
        .select()
        .from(communities)
        .where(ilike(communities.name, `%${search}%`))
        .orderBy(asc(communities.name))
        .limit(limit)
        .offset(offset)
    : await db
        .select()
        .from(communities)
        .orderBy(asc(communities.name))
        .limit(limit)
        .offset(offset);

  const total = await db.select({ count: communities.id }).from(communities);

  return {
    communities: result,
    total: total.length,
    limit,
    offset,
  };
};

/**
 * Get community by ID
 */
export const getCommunityByIdService = async (id: string) => {
  const result = await db.select().from(communities).where(eq(communities.id, id));
  return result[0] || null;
};

/**
 * Search communities by name
 */
export const searchCommunitiesService = async (searchTerm: string) => {
  return await db
    .select()
    .from(communities)
    .where(ilike(communities.name, `%${searchTerm}%`))
    .orderBy(asc(communities.name));
};

/**
 * Create a new community
 */
export const createCommunityService = async (data: TCommunityInsert) => {
  const result = await db.insert(communities).values(data).returning();
  return result[0];
};

/**
 * Update a community
 */
export const updateCommunityService = async (
  id: string,
  data: Partial<TCommunityInsert>
) => {
  const result = await db
    .update(communities)
    .set(data)
    .where(eq(communities.id, id))
    .returning();
  return result[0] || null;
};

/**
 * Delete a community
 */
export const deleteCommunityService = async (id: string) => {
  const result = await db
    .delete(communities)
    .where(eq(communities.id, id))
    .returning();
  return result[0] || null;
};

/**
 * Get community statistics
 */
export const getCommunityStatsService = async () => {
  const allCommunities = await db.select().from(communities);

  return {
    total: allCommunities.length,
  };
};
