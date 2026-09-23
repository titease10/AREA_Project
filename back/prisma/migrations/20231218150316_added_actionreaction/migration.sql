-- CreateTable
CREATE TABLE "ActionReaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actionEventId" TEXT NOT NULL,
    "reactionEventId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActionReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActionReaction_userId_idx" ON "ActionReaction"("userId");

-- AddForeignKey
ALTER TABLE "ActionReaction" ADD CONSTRAINT "ActionReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
