-- AlterTable
ALTER TABLE "Resume" ADD COLUMN "educationInstitution" TEXT;
ALTER TABLE "Resume" ADD COLUMN "educationYears" TEXT;

-- AlterTable
ALTER TABLE "ResumeSpecialStatus" ADD COLUMN "disabilityGroup" TEXT;
ALTER TABLE "ResumeSpecialStatus" ADD COLUMN "docDate" TEXT;
ALTER TABLE "ResumeSpecialStatus" ADD COLUMN "docNumber" TEXT;
