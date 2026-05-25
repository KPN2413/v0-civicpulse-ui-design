-- Add nullable SLA tracking fields without changing existing report rows.
ALTER TABLE "Report"
ADD COLUMN "slaDueAt" TIMESTAMP(3),
ADD COLUMN "firstAssignedAt" TIMESTAMP(3);
