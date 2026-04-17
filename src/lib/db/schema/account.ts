import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  datetime,
  index,
  int,
  mysqlTable,
  tinyint,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const legacyAccounts = mysqlTable(
  "account",
  {
    id: int("id").autoincrement().notNull().primaryKey(),
    login: varchar("login", { length: 30 }).notNull().default(""),
    password: varchar("password", { length: 45 }).notNull().default(""),
    socialId: varchar("social_id", { length: 13 }).notNull().default(""),
    email: varchar("email", { length: 64 }).notNull().default(""),
    createTime: datetime("create_time", { mode: "string" })
      .notNull()
      .default("0000-00-00 00:00:00"),
    isTestor: tinyint("is_testor").notNull().default(0),
    status: varchar("status", { length: 8 }).notNull().default("OK"),
    newsletter: tinyint("newsletter").default(0),
    empire: tinyint("empire").notNull().default(0),
    nameChecked: tinyint("name_checked").notNull().default(0),
    availDt: datetime("availDt", { mode: "string" })
      .notNull()
      .default("0000-00-00 00:00:00"),
    mileage: int("mileage").notNull().default(0),
    cash: int("cash").notNull().default(0),
    goldExpire: datetime("gold_expire", { mode: "string" })
      .notNull()
      .default("0000-00-00 00:00:00"),
    silverExpire: datetime("silver_expire", { mode: "string" })
      .notNull()
      .default("0000-00-00 00:00:00"),
    safeboxExpire: datetime("safebox_expire", { mode: "string" })
      .notNull()
      .default("0000-00-00 00:00:00"),
    autolootExpire: datetime("autoloot_expire", { mode: "string" })
      .notNull()
      .default("0000-00-00 00:00:00"),
    fishMindExpire: datetime("fish_mind_expire", { mode: "string" })
      .notNull()
      .default("0000-00-00 00:00:00"),
    marriageFastExpire: datetime("marriage_fast_expire", { mode: "string" })
      .notNull()
      .default("0000-00-00 00:00:00"),
    moneyDropRateExpire: datetime("money_drop_rate_expire", { mode: "string" })
      .notNull()
      .default("0000-00-00 00:00:00"),
    totalCash: int("total_cash").notNull().default(0),
    totalMileage: int("total_mileage").notNull().default(0),
    channelCompany: varchar("channel_company", { length: 30 })
      .notNull()
      .default(""),
    ip: varchar("ip", { length: 255 }),
    lastPlay: datetime("last_play", { mode: "string" })
      .notNull()
      .default("0000-00-00 00:00:00"),
  },
  (table) => [
    uniqueIndex("login").on(table.login),
    index("social_id").on(table.socialId),
  ],
);

export type LegacyAccount = InferSelectModel<typeof legacyAccounts>;
export type NewLegacyAccount = InferInsertModel<typeof legacyAccounts>;
