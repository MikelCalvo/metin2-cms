CREATE TABLE IF NOT EXISTS `password_recovery_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `account_id` int(11) NOT NULL,
  `login` varchar(30) NOT NULL,
  `email` varchar(64) NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `requested_ip` varchar(255) DEFAULT NULL,
  `requested_user_agent` varchar(512) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `expires_at` datetime NOT NULL,
  `consumed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `password_recovery_tokens_token_hash_idx` (`token_hash`),
  KEY `password_recovery_tokens_account_id_idx` (`account_id`),
  KEY `password_recovery_tokens_expires_at_idx` (`expires_at`),
  KEY `password_recovery_tokens_login_idx` (`login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
