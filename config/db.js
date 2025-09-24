import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
    timezone: "+07:00"
  }
);

export async function initDB() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("✅ Database connected & synced");
  } catch (e) {
    console.error("❌ DB error:", e);
    process.exit(1);
  }
}
