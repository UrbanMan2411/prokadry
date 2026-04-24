-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME
);

-- CreateTable
CREATE TABLE "Employer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inn" TEXT NOT NULL,
    "ogrn" TEXT,
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "logoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" DATETIME,
    "approvedById" TEXT,
    CONSTRAINT "Employer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "patronymic" TEXT,
    "gender" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "salary" INTEGER,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "education" TEXT NOT NULL,
    "workMode" TEXT NOT NULL,
    "about" TEXT,
    "photoUrl" TEXT,
    "hasPhoto" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "rejectReason" TEXT,
    "moderatedById" TEXT,
    "moderatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkExperience" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "resumeId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "fromMonth" TEXT NOT NULL,
    "toMonth" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "WorkExperience_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResumeActivityArea" (
    "resumeId" TEXT NOT NULL,
    "dictItemId" TEXT NOT NULL,

    PRIMARY KEY ("resumeId", "dictItemId"),
    CONSTRAINT "ResumeActivityArea_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResumeActivityArea_dictItemId_fkey" FOREIGN KEY ("dictItemId") REFERENCES "DictItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResumeTest" (
    "resumeId" TEXT NOT NULL,
    "dictItemId" TEXT NOT NULL,
    "passedAt" DATETIME,

    PRIMARY KEY ("resumeId", "dictItemId"),
    CONSTRAINT "ResumeTest_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResumeTest_dictItemId_fkey" FOREIGN KEY ("dictItemId") REFERENCES "DictItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResumeSpecialStatus" (
    "resumeId" TEXT NOT NULL,
    "dictItemId" TEXT NOT NULL,
    "confirmedAt" DATETIME,
    "documentRef" TEXT,

    PRIMARY KEY ("resumeId", "dictItemId"),
    CONSTRAINT "ResumeSpecialStatus_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResumeSpecialStatus_dictItemId_fkey" FOREIGN KEY ("dictItemId") REFERENCES "DictItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DictItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Vacancy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "workMode" TEXT NOT NULL,
    "salaryFrom" INTEGER,
    "salaryTo" INTEGER,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "archivedAt" DATETIME,
    CONSTRAINT "Vacancy_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VacancySkill" (
    "vacancyId" TEXT NOT NULL,
    "dictItemId" TEXT NOT NULL,

    PRIMARY KEY ("vacancyId", "dictItemId"),
    CONSTRAINT "VacancySkill_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VacancySkill_dictItemId_fkey" FOREIGN KEY ("dictItemId") REFERENCES "DictItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "vacancyId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "replyMessage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" DATETIME,
    "respondedAt" DATETIME,
    "withdrawnAt" DATETIME,
    CONSTRAINT "Invitation_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invitation_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "invitationId" TEXT,
    "text" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Favorite" (
    "employerId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    PRIMARY KEY ("employerId", "resumeId"),
    CONSTRAINT "Favorite_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Favorite_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "detail" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_userId_key" ON "Employer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_inn_key" ON "Employer"("inn");

-- CreateIndex
CREATE INDEX "Employer_status_idx" ON "Employer"("status");

-- CreateIndex
CREATE INDEX "Employer_region_idx" ON "Employer"("region");

-- CreateIndex
CREATE INDEX "Employer_inn_idx" ON "Employer"("inn");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_userId_key" ON "Resume"("userId");

-- CreateIndex
CREATE INDEX "Resume_status_idx" ON "Resume"("status");

-- CreateIndex
CREATE INDEX "Resume_region_idx" ON "Resume"("region");

-- CreateIndex
CREATE INDEX "Resume_position_idx" ON "Resume"("position");

-- CreateIndex
CREATE INDEX "Resume_salary_idx" ON "Resume"("salary");

-- CreateIndex
CREATE INDEX "Resume_experience_idx" ON "Resume"("experience");

-- CreateIndex
CREATE INDEX "Resume_gender_idx" ON "Resume"("gender");

-- CreateIndex
CREATE INDEX "WorkExperience_resumeId_idx" ON "WorkExperience"("resumeId");

-- CreateIndex
CREATE INDEX "ResumeActivityArea_dictItemId_idx" ON "ResumeActivityArea"("dictItemId");

-- CreateIndex
CREATE INDEX "ResumeTest_dictItemId_idx" ON "ResumeTest"("dictItemId");

-- CreateIndex
CREATE INDEX "ResumeSpecialStatus_dictItemId_idx" ON "ResumeSpecialStatus"("dictItemId");

-- CreateIndex
CREATE INDEX "DictItem_category_isActive_sortOrder_idx" ON "DictItem"("category", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "DictItem_category_value_key" ON "DictItem"("category", "value");

-- CreateIndex
CREATE INDEX "Vacancy_employerId_status_idx" ON "Vacancy"("employerId", "status");

-- CreateIndex
CREATE INDEX "Vacancy_status_region_idx" ON "Vacancy"("status", "region");

-- CreateIndex
CREATE INDEX "Invitation_resumeId_status_idx" ON "Invitation"("resumeId", "status");

-- CreateIndex
CREATE INDEX "Invitation_vacancyId_status_idx" ON "Invitation"("vacancyId", "status");

-- CreateIndex
CREATE INDEX "Invitation_status_idx" ON "Invitation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_resumeId_vacancyId_key" ON "Invitation"("resumeId", "vacancyId");

-- CreateIndex
CREATE INDEX "Message_recipientId_isRead_idx" ON "Message"("recipientId", "isRead");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_invitationId_idx" ON "Message"("invitationId");

-- CreateIndex
CREATE INDEX "Favorite_employerId_idx" ON "Favorite"("employerId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
