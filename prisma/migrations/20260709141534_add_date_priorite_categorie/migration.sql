-- CreateTable
CREATE TABLE "submissions" (
    "id" SERIAL NOT NULL,
    "user_email" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "date_evenement" TIMESTAMP(3) NOT NULL,
    "priorite" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);
