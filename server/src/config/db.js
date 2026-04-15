import mysql from "mysql2/promise";
import { Sequelize } from "sequelize";
import { loadEnv } from "./env.js";

loadEnv();

const connectionConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "flipkart_clone"
};

const pool = mysql.createPool({
  ...connectionConfig,
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const sequelize = new Sequelize(
  connectionConfig.database,
  connectionConfig.user,
  connectionConfig.password,
  {
    host: connectionConfig.host,
    port: connectionConfig.port,
    dialect: "mysql",
    logging: false
  }
);

export const db = pool;

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}
