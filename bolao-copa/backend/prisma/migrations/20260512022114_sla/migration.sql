/*
  Warnings:

  - A unique constraint covering the columns `[usuario_id,jogo_id,grupo_id]` on the table `palpite` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `palpite_usuario_id_jogo_id_key` ON `palpite`;

-- AlterTable
ALTER TABLE `membro_grupo` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'aprovado';

-- CreateIndex
CREATE UNIQUE INDEX `palpite_usuario_id_jogo_id_grupo_id_key` ON `palpite`(`usuario_id`, `jogo_id`, `grupo_id`);

-- AddForeignKey
ALTER TABLE `palpite` ADD CONSTRAINT `palpite_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
