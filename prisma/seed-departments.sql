INSERT INTO "Department" ("id", "name", "description", "createdAt", "updatedAt")
VALUES
  ('dept_roads_infra', 'Roads & Infrastructure', 'Handles road damage, potholes, footpaths, bridges, and public infrastructure issues.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('dept_sanitation', 'Sanitation', 'Handles garbage overflow, waste collection, cleanliness, and public hygiene issues.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('dept_street_lighting', 'Street Lighting', 'Handles street light failures, damaged poles, and lighting-related public safety issues.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('dept_water_supply', 'Water Supply', 'Handles water leakage, water shortage, pipe damage, and supply-related issues.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('dept_drainage', 'Drainage', 'Handles blocked drains, sewage overflow, flooding, and stormwater issues.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('dept_public_safety', 'Public Safety', 'Handles public safety hazards, unsafe areas, exposed wires, and emergency civic risks.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('dept_general_admin', 'General Administration', 'Handles uncategorised civic issues and administrative review cases.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name")
DO UPDATE SET
  "description" = EXCLUDED."description",
  "updatedAt" = CURRENT_TIMESTAMP;