-- DropForeignKey
ALTER TABLE "public"."cards" DROP CONSTRAINT "cards_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."cards" DROP CONSTRAINT "cards_creatorId_fkey";

-- AddForeignKey
ALTER TABLE "public"."cards" ADD CONSTRAINT "cards_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "public"."users"("clerkId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cards" ADD CONSTRAINT "cards_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;
