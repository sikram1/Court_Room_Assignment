-- CreateTable
CREATE TABLE "CourtRecord" (
    "id" SERIAL NOT NULL,
    "userName" TEXT NOT NULL,
    "sessionStage" TEXT,
    "caseDocument" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourtRecord_pkey" PRIMARY KEY ("id")
);
