-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'CLOSED');

-- CreateEnum
CREATE TYPE "IssuePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('ISSUE_CREATED', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'ASSIGNEE_CHANGED', 'COMMENT_ADDED', 'LABEL_ADDED', 'LABEL_REMOVED');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "orgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "IssuePriority" NOT NULL DEFAULT 'MEDIUM',
    "projectId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "duplicateOfId" TEXT,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueLabel" (
    "issueId" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,

    CONSTRAINT "IssueLabel_pkey" PRIMARY KEY ("issueId","labelId")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "issueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Project_orgId_idx" ON "Project"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_orgId_slug_key" ON "Project"("orgId", "slug");

-- CreateIndex
CREATE INDEX "Issue_projectId_status_idx" ON "Issue"("projectId", "status");

-- CreateIndex
CREATE INDEX "Issue_projectId_priority_idx" ON "Issue"("projectId", "priority");

-- CreateIndex
CREATE INDEX "Issue_creatorId_idx" ON "Issue"("creatorId");

-- CreateIndex
CREATE INDEX "Issue_assigneeId_idx" ON "Issue"("assigneeId");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_projectId_number_key" ON "Issue"("projectId", "number");

-- CreateIndex
CREATE INDEX "Comment_issueId_idx" ON "Comment"("issueId");

-- CreateIndex
CREATE INDEX "Vote_issueId_idx" ON "Vote"("issueId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_issueId_userId_key" ON "Vote"("issueId", "userId");

-- CreateIndex
CREATE INDEX "Label_projectId_idx" ON "Label"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Label_projectId_name_key" ON "Label"("projectId", "name");

-- CreateIndex
CREATE INDEX "Activity_issueId_idx" ON "Activity"("issueId");

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "Activity"("userId");

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_duplicateOfId_fkey" FOREIGN KEY ("duplicateOfId") REFERENCES "Issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueLabel" ADD CONSTRAINT "IssueLabel_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueLabel" ADD CONSTRAINT "IssueLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
