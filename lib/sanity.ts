import { createClient } from "@sanity/client";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const apiVersion = process.env.SANITY_API_VERSION || "2025-01-01";

if (!projectId || !dataset) {
  // In production we want this to fail fast; for dev it will just make
  // category requests return 500 errors until configured.
  // eslint-disable-next-line no-console
  console.warn(
    "Sanity projectId/dataset not configured. Set SANITY_PROJECT_ID and SANITY_DATASET."
  );
}

export const sanityClient = createClient({
  projectId: projectId || "",
  dataset: dataset || "",
  apiVersion,
  useCdn: true,
});

