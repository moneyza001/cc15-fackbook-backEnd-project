/*
  Warnings:

  - The values [PENNING] on the enum `Friend_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Friend` MODIFY `status` ENUM('ACCEPTED', 'PENDING') NOT NULL;
