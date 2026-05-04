CREATE TABLE "VacancyActivityArea" (
    "vacancyId"  TEXT NOT NULL,
    "dictItemId" TEXT NOT NULL,
    CONSTRAINT "VacancyActivityArea_pkey" PRIMARY KEY ("vacancyId", "dictItemId"),
    CONSTRAINT "VacancyActivityArea_vacancyId_fkey"  FOREIGN KEY ("vacancyId")  REFERENCES "Vacancy"("id")  ON DELETE CASCADE  ON UPDATE CASCADE,
    CONSTRAINT "VacancyActivityArea_dictItemId_fkey" FOREIGN KEY ("dictItemId") REFERENCES "DictItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
