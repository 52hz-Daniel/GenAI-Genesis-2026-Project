export type EventName =
  | "page_view"
  | "landing_cta_click"
  | "time_to_first_resume_bullet"
  | "interview_started"
  | "interview_step"
  | "interview_completed"
  | "interview_dropped"
  | "share_to_linkedin_click"
  | "badge_copied"
  | "badge_image_downloaded";

export type EventProps = Record<string, string | number | undefined>;

import { logEventBatched } from "./analytics-batched";

export function logEvent(name: EventName, props?: EventProps): void {
  logEventBatched(name, props);
}
