-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reviewer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "truncated" BOOLEAN NOT NULL DEFAULT false,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "timeLimitSeconds" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Reviewer" ("content", "createdAt", "id", "sourceType", "title", "truncated") SELECT "content", "createdAt", "id", "sourceType", "title", "truncated" FROM "Reviewer";
DROP TABLE "Reviewer";
ALTER TABLE "new_Reviewer" RENAME TO "Reviewer";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
