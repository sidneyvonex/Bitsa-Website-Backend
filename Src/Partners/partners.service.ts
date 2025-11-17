import { eq, desc, asc, ilike } from "drizzle-orm";
import db from "../drizzle/db";
import { partners, TPartnerInsert, TPartnerSelect } from "../drizzle/schema";

/**
 * Get all partners with pagination
 */
export const getAllPartnersService = async (filters?: {
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const { search, limit = 50, offset = 0 } = filters || {};

  const result = search
    ? await db
        .select()
        .from(partners)
        .where(ilike(partners.name, `%${search}%`))
        .orderBy(asc(partners.name))
        .limit(limit)
        .offset(offset)
    : await db
        .select()
        .from(partners)
        .orderBy(asc(partners.name))
        .limit(limit)
        .offset(offset);

  const total = await db.select({ count: partners.id }).from(partners);

  return {
    partners: result,
    total: total.length,
    limit,
    offset,
  };
};

/**
 * Get partner by ID
 */
export const getPartnerByIdService = async (id: string) => {
  const result = await db.select().from(partners).where(eq(partners.id, id));
  return result[0] || null;
};

/**
 * Search partners by name
 */
export const searchPartnersService = async (searchTerm: string) => {
  return await db
    .select()
    .from(partners)
    .where(ilike(partners.name, `%${searchTerm}%`))
    .orderBy(asc(partners.name));
};

/**
 * Create a new partner
 */
export const createPartnerService = async (data: TPartnerInsert) => {
  const result = await db.insert(partners).values(data).returning();
  return result[0];
};

/**
 * Update a partner
 */
export const updatePartnerService = async (
  id: string,
  data: Partial<TPartnerInsert>
) => {
  const result = await db
    .update(partners)
    .set(data)
    .where(eq(partners.id, id))
    .returning();
  return result[0] || null;
};

/**
 * Delete a partner
 */
export const deletePartnerService = async (id: string) => {
  const result = await db
    .delete(partners)
    .where(eq(partners.id, id))
    .returning();
  return result[0] || null;
};

/**
 * Get partner statistics
 */
export const getPartnerStatsService = async () => {
  const allPartners = await db.select().from(partners);

  return {
    total: allPartners.length,
  };
};
