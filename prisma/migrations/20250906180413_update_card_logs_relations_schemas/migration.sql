-- DropForeignKey
ALTER TABLE "public"."card_logs" DROP CONSTRAINT "card_logs_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."card_logs" ADD CONSTRAINT "card_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;
