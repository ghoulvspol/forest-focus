-- =============================================================
-- AI 宠物数字分身 — 数据库 Schema
-- 数据库：MySQL 8.0+ / 阿里云 PolarDB MySQL
-- 字符集：utf8mb4（支持 emoji）
-- =============================================================
--
-- 表关系图：
--
--   users
--     │ id
--     │
--     ├──< pets (user_id)
--     │       │ id
--     │       │
--     │       ├──< daily_interactions (pet_id)
--     │       │       每日互动次数（喂食/抚摸/玩耍）
--     │       │
--     │       └──< notify_logs (pet_id)
--     │               微信推送记录（防重复推送）
--     │
--     └──< notify_logs (user_id)
--
-- 状态机（pets.stats JSON）：
--
--   饱食度/清洁度/快乐度 ∈ [5, 100]
--
--   互动      → 属性 +N（上限 100）
--   Cron/小时 → 属性 -3（下限 5）
--
--   情绪状态（由 happiness 驱动）：
--     happy   : happiness >= 60
--     normal  : happiness 30~59
--     sad     : happiness < 30   → 触发微信推送
--
-- =============================================================

CREATE DATABASE IF NOT EXISTS ai_pet
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ai_pet;

-- =============================================================
-- 用户表
-- 注：open_id 是微信小程序专属 ID，union_id 预留供将来
--     扩展到公众号/H5/App 时做 OpenID→UnionID 迁移用
--     (见 TODOS.md TODO 2)
-- =============================================================
CREATE TABLE users (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  open_id       VARCHAR(64)     NOT NULL COMMENT '微信小程序 OpenID',
  union_id      VARCHAR(64)     NULL     COMMENT '微信 UnionID，跨平台唯一，初始为空 (TODO 2)',
  nickname      VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '微信昵称',
  avatar_url    VARCHAR(512)    NOT NULL DEFAULT '' COMMENT '微信头像 URL',
  -- 微信订阅消息授权状态（true=已授权，false=拒绝/未授权）
  -- 推送前必须检查此字段，未授权时静默跳过
  notify_enabled TINYINT(1)     NOT NULL DEFAULT 0,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_open_id (open_id),
  KEY idx_union_id (union_id)    -- 为迁移时查询预留索引
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- 宠物表
-- MVP 设计：一个用户一只宠物（user_id UNIQUE）
--           有多宠物需求时去掉 unique 约束即可
-- =============================================================
CREATE TABLE pets (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL,
  name          VARCHAR(32)     NOT NULL COMMENT '宠物名字',
  species       ENUM('cat','dog','other') NOT NULL DEFAULT 'cat',

  -- 图像字段
  -- original_image_url: 用户上传的原图（OSS 路径）
  -- stylized_image_url: AI 风格化后选定的图（OSS 路径）
  -- image_style: 用户选择的风格（用于展示和切换）
  -- image_status: 同步处理状态，AI 生成期间为 processing
  --   pending    → 刚上传，等待 AI 处理
  --   processing → AI API 调用中（前端显示 loading）
  --   done       → 风格化完成，图像可用
  --   failed     → AI 超时或失败，需用户重试
  original_image_url  VARCHAR(512) NOT NULL DEFAULT '',
  stylized_image_url  VARCHAR(512) NOT NULL DEFAULT '' COMMENT '选定风格的图',
  image_style         VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '如 cartoon / watercolor / pixel',
  image_status        ENUM('pending','processing','done','failed') NOT NULL DEFAULT 'pending',
  image_updated_at    DATETIME     NULL COMMENT 'AI 处理完成时间',

  -- 宠物状态（JSON 存储，便于后续扩展属性无需改表）
  -- 结构：{"satiety": 80, "cleanliness": 70, "happiness": 90}
  -- 所有值范围：[5, 100]
  -- 读取时必须做 schema 校验，缺失字段用默认值 100 兜底
  stats         JSON            NOT NULL COMMENT '{"satiety":100,"cleanliness":100,"happiness":100}',

  -- Cron 相关：记录上次 Cron 执行时间，用于计算本次应衰减多少
  -- 公式：衰减量 = floor((now - last_cron_at) / 3600) * 3，最低至 5
  -- 注：用户量超 10w 时需改为分批 Cron（见 TODOS.md TODO 1 扩展注释）
  last_cron_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_user_pet (user_id),    -- MVP：一人一宠
  CONSTRAINT fk_pets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- 每日互动记录表
-- 设计：每 (pet_id, interaction_type, interaction_date) 一行
--       记录当日该类型已互动次数，用 ON DUPLICATE KEY UPDATE 做 upsert
-- 每日上限（写在应用层）：feed=3, pet_action=5, play=2
-- =============================================================
CREATE TABLE daily_interactions (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pet_id            BIGINT UNSIGNED NOT NULL,
  interaction_type  ENUM('feed','pet_action','play') NOT NULL,
  interaction_date  DATE            NOT NULL COMMENT '互动日期（按北京时间 UTC+8）',
  count             TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '当日已互动次数',
  -- 互动效果记录（仅最后一次，用于调试）
  stats_delta       JSON            NULL COMMENT '本次互动对 stats 的增量，如 {"satiety":10}',
  last_interacted_at DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  -- 复合唯一键：保证每宠物每天每类型只有一行
  UNIQUE KEY uq_pet_type_date (pet_id, interaction_type, interaction_date),
  KEY idx_pet_date (pet_id, interaction_date),
  CONSTRAINT fk_interactions_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- 微信推送日志表
-- 作用：防止同一条件重复推送，记录推送历史
-- 推送条件：宠物 happiness < 30（每 24 小时最多推送 1 次）
-- =============================================================
CREATE TABLE notify_logs (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  pet_id      BIGINT UNSIGNED NOT NULL,
  notify_type ENUM('low_stats','welcome','daily_remind') NOT NULL DEFAULT 'low_stats',
  sent_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- 推送时宠物的快照 stats（用于排查推送时机是否正确）
  stats_snapshot JSON         NULL,
  PRIMARY KEY (id),
  KEY idx_pet_notify (pet_id, notify_type, sent_at),
  KEY idx_user_notify (user_id, sent_at),
  CONSTRAINT fk_notify_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notify_pet  FOREIGN KEY (pet_id)  REFERENCES pets(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- 初始数据 / 测试数据（开发环境用，生产环境不执行）
-- =============================================================
-- INSERT INTO users (open_id, nickname) VALUES ('o_test_openid_001', '测试用户');
-- INSERT INTO pets (user_id, name, species, stats)
--   VALUES (1, '小橘', 'cat', '{"satiety":100,"cleanliness":100,"happiness":100}');


-- =============================================================
-- 常用查询备注
-- =============================================================
-- 查询宠物当前状态：
--   SELECT p.*, JSON_EXTRACT(p.stats, '$.happiness') AS happiness
--   FROM pets p WHERE p.user_id = ?;
--
-- 查询今日喂食次数：
--   SELECT count FROM daily_interactions
--   WHERE pet_id = ? AND interaction_type = 'feed'
--     AND interaction_date = CURDATE();
--
-- Cron 每小时衰减（批量更新，MVP 阶段全量）：
--   UPDATE pets
--   SET stats = JSON_SET(
--     stats,
--     '$.satiety',    GREATEST(5, CAST(JSON_EXTRACT(stats, '$.satiety')    AS UNSIGNED) - 3),
--     '$.cleanliness',GREATEST(5, CAST(JSON_EXTRACT(stats, '$.cleanliness') AS UNSIGNED) - 3),
--     '$.happiness',  GREATEST(5, CAST(JSON_EXTRACT(stats, '$.happiness')   AS UNSIGNED) - 3)
--   ),
--   last_cron_at = NOW()
--   WHERE last_cron_at < DATE_SUB(NOW(), INTERVAL 55 MINUTE);
--
-- 查询需要推送的宠物（happiness < 30，24 小时内未推过）：
--   SELECT p.id, p.user_id
--   FROM pets p
--   JOIN users u ON u.id = p.user_id AND u.notify_enabled = 1
--   WHERE CAST(JSON_EXTRACT(p.stats, '$.happiness') AS UNSIGNED) < 30
--     AND NOT EXISTS (
--       SELECT 1 FROM notify_logs n
--       WHERE n.pet_id = p.id AND n.notify_type = 'low_stats'
--         AND n.sent_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
--     );
