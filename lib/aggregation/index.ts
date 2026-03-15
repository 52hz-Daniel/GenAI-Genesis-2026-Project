/**
 * Community sector aggregation: user vector, matching, dossier.
 * Owner: Agent 1 (Integrations & profile data)
 */
export { buildUserSummaryForMatching } from "./user-vector";
export { getRankedOpportunitiesForUser } from "./matching";
export { buildConfidenceDossier } from "./dossier";
export type { OpportunityFeedItem, OpportunityContentType, ConfidenceDossier } from "./types";
