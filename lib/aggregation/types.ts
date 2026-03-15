/**
 * Community sector: types for opportunities feed and matching.
 * Owner: Agent 1 (Integrations & profile data)
 */

export type OpportunityRow = {
  id: string;
  staging_id: string | null;
  title: string;
  description: string | null;
  url: string | null;
  source: string;
  required_competencies: string[];
  urgency: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
};

export type OpportunityStagingRow = {
  id: string;
  source: string;
  url: string | null;
  raw_text: string;
  fetched_at: Date;
};

export type UserOpportunityActionRow = {
  id: string;
  user_id: string;
  opportunity_id: string;
  action: "view" | "apply" | "save" | "reject";
  created_at: Date;
};

export type OpportunityContentType = "opportunity" | "trend";

export type OpportunityFeedItem = {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  source: string;
  required_competencies: string[];
  urgency: string | null;
  opens_at: string | null;
  closes_at: string | null;
  content_type: OpportunityContentType;
  created_at: string;
};

export type ConfidenceDossier = {
  competencyBridge: string;
  blindSpotWarning: string;
  socraticPrompt: string;
};
