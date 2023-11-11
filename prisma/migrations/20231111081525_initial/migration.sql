-- CreateTable
CREATE TABLE "Todo" (
    "id" SERIAL NOT NULL,
    "content" TEXT,
    "done" BOOLEAN,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);
