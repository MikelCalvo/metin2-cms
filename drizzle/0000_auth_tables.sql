CREATE TABLE `web_sessions` (
  `id` varchar(128) NOT NULL,
  `account_id` int(11) NOT NULL,
  `login` varchar(30) NOT NULL,
  `ip` varchar(255) DEFAULT NULL,
  `user_agent` varchar(512) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `last_seen_at` datetime NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `web_sessions_account_id_idx` (`account_id`),
  KEY `web_sessions_expires_at_idx` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `auth_audit_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_type` varchar(64) NOT NULL,
  `login` varchar(30) NOT NULL DEFAULT '',
  `account_id` int(11) DEFAULT NULL,
  `ip` varchar(255) DEFAULT NULL,
  `user_agent` varchar(512) DEFAULT NULL,
  `success` tinyint(1) NOT NULL DEFAULT 0,
  `detail` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `auth_audit_log_event_type_idx` (`event_type`),
  KEY `auth_audit_log_login_idx` (`login`),
  KEY `auth_audit_log_created_at_idx` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
