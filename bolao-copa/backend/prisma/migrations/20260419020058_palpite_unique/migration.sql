/*
  Warnings:
  - A unique constraint covering the columns `[usuario_id,jogo_id]` on the table `palpite` will be added. If there are existing duplicate values, this will fail.
*/
-- DropForeignKey
ALTER TABLE `palpite` DROP FOREIGN KEY `palpite_usuario_id_fkey`;

-- DropForeignKey
ALTER TABLE `palpite` DROP FOREIGN KEY `palpite_grupo_id_fkey`;

-- DropIndex
DROP INDEX `palpite_usuario_id_jogo_id_grupo_id_key` ON `palpite`;

-- CreateIndex
CREATE UNIQUE INDEX `palpite_usuario_id_jogo_id_key` ON `palpite`(`usuario_id`, `jogo_id`);

-- AddForeignKey
ALTER TABLE `palpite` ADD CONSTRAINT `palpite_grupo_id_fkey` FOREIGN KEY (`grupo_id`) REFERENCES `grupo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;