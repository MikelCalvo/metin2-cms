# Live Metin2 account schema

This document freezes the auth-relevant contract observed in the live MariaDB instance on `metin2server` during bootstrap.

## Source of truth

Read-only inspection of:
- database: `account`
- table: `account`

## Confirmed columns relevant to the CMS

- `id int(11)` primary key
- `login varchar(30)` unique
- `password varchar(45)`
- `social_id varchar(13)`
- `email varchar(64)`
- `status varchar(8)` default `OK`
- `mileage int(11)` default `0`
- `cash int(11)` default `0`
- `last_play datetime`

Additional fields currently present and mirrored in the schema layer:
- `create_time`
- `is_testor`
- `newsletter`
- `empire`
- `name_checked`
- `availDt`
- `gold_expire`
- `silver_expire`
- `safebox_expire`
- `autoloot_expire`
- `fish_mind_expire`
- `marriage_fast_expire`
- `money_drop_rate_expire`
- `total_cash`
- `total_mileage`
- `channel_company`
- `ip`

## Fields explicitly not present

The old PHP CMS examples are not aligned with the live schema.

These fields are not present in the live `account.account` table:
- `real_name`
- `coins`

Because of that, the new CMS must not assume those columns exist.

## Charset and collation

Observed table settings:
- charset: `ascii`
- collation: `ascii_general_ci`

Practical implication:
- login/register validation must respect a restrictive character set
- we should avoid introducing assumptions based on Unicode-friendly modern schemas

## Password format

Read-only aggregate checks showed:
- all current password hashes are 41 characters long
- they match the `*HEX` style pattern used by MariaDB/MySQL `PASSWORD()`
- running `SELECT PASSWORD('metin2cms_test')` on the live DB returns the same 41-character shape

Practical implication:
- MVP login/register must remain compatible with the current legacy password format
- future migrations to a modern password scheme must be planned explicitly, not assumed

## Domain naming notes

The live table exposes:
- `cash`
- `mileage`

It does not expose a canonical `coins` field.

Repository code should therefore prefer explicit domain names like:
- `cashBalance`
- `mileageBalance`

while mapping them carefully to the legacy DB columns.
