-- CreateTable
CREATE TABLE `usuario` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha_hash` VARCHAR(191) NOT NULL,
    `avatar_url` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `edicao_campeonato` (
    `id` VARCHAR(191) NOT NULL,
    `api_id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `ano` INTEGER NOT NULL,
    `inicio_em` DATETIME(3) NOT NULL,
    `fim_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `edicao_campeonato_api_id_key`(`api_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `time` (
    `id` VARCHAR(191) NOT NULL,
    `api_id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `nome_curto` VARCHAR(191) NULL,
    `sigla` VARCHAR(191) NULL,
    `bandeira_url` VARCHAR(191) NULL,
    `grupo_fase` VARCHAR(191) NULL,

    UNIQUE INDEX `time_api_id_key`(`api_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jogo` (
    `id` VARCHAR(191) NOT NULL,
    `api_id` VARCHAR(191) NOT NULL,
    `edicao_id` VARCHAR(191) NOT NULL,
    `time_casa_id` VARCHAR(191) NULL,
    `time_visitante_id` VARCHAR(191) NULL,
    `fase` VARCHAR(191) NOT NULL,
    `grupo_fase` VARCHAR(191) NULL,
    `rodada` INTEGER NULL,
    `gols_casa` INTEGER NULL,
    `gols_visitante` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'agendado',
    `inicio_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `jogo_api_id_key`(`api_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grupo` (
    `id` VARCHAR(191) NOT NULL,
    `edicao_id` VARCHAR(191) NOT NULL,
    `criado_por_id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `codigo_convite` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `grupo_codigo_convite_key`(`codigo_convite`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `membro_grupo` (
    `id` VARCHAR(191) NOT NULL,
    `grupo_id` VARCHAR(191) NOT NULL,
    `usuario_id` VARCHAR(191) NOT NULL,
    `papel` VARCHAR(191) NOT NULL DEFAULT 'membro',
    `pontuacao_total` INTEGER NOT NULL DEFAULT 0,
    `entrou_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `membro_grupo_grupo_id_usuario_id_key`(`grupo_id`, `usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `palpite` (
    `id` VARCHAR(191) NOT NULL,
    `usuario_id` VARCHAR(191) NOT NULL,
    `jogo_id` VARCHAR(191) NOT NULL,
    `grupo_id` VARCHAR(191) NOT NULL,
    `gols_casa` INTEGER NOT NULL,
    `gols_visitante` INTEGER NOT NULL,
    `pontos_ganhos` INTEGER NOT NULL DEFAULT 0,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `palpite_usuario_id_jogo_id_grupo_id_key`(`usuario_id`, `jogo_id`, `grupo_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `jogo` ADD CONSTRAINT `jogo_edicao_id_fkey` FOREIGN KEY (`edicao_id`) REFERENCES `edicao_campeonato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jogo` ADD CONSTRAINT `jogo_time_casa_id_fkey` FOREIGN KEY (`time_casa_id`) REFERENCES `time`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jogo` ADD CONSTRAINT `jogo_time_visitante_id_fkey` FOREIGN KEY (`time_visitante_id`) REFERENCES `time`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grupo` ADD CONSTRAINT `grupo_edicao_id_fkey` FOREIGN KEY (`edicao_id`) REFERENCES `edicao_campeonato`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grupo` ADD CONSTRAINT `grupo_criado_por_id_fkey` FOREIGN KEY (`criado_por_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `membro_grupo` ADD CONSTRAINT `membro_grupo_grupo_id_fkey` FOREIGN KEY (`grupo_id`) REFERENCES `grupo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `membro_grupo` ADD CONSTRAINT `membro_grupo_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `palpite` ADD CONSTRAINT `palpite_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `palpite` ADD CONSTRAINT `palpite_jogo_id_fkey` FOREIGN KEY (`jogo_id`) REFERENCES `jogo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `palpite` ADD CONSTRAINT `palpite_grupo_id_fkey` FOREIGN KEY (`grupo_id`) REFERENCES `grupo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
