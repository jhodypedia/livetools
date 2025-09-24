import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Schedule extends Model {}

Schedule.init({
  title: DataTypes.STRING,
  platform: DataTypes.STRING,
  streamKey: DataTypes.STRING,
  sourceType: DataTypes.STRING,
  sourcePath: DataTypes.STRING,
  vBitrate: DataTypes.STRING,
  aBitrate: DataTypes.STRING,
  preset: DataTypes.STRING,
  fps: DataTypes.INTEGER,
  loop: DataTypes.BOOLEAN,
  mode: DataTypes.STRING,        // "now" | "schedule"
  startAt: DataTypes.DATE,
  timezone: DataTypes.STRING,
  clientTimeISO: DataTypes.STRING,
  userAgent: DataTypes.STRING,
  status: { type: DataTypes.STRING, defaultValue:"scheduled" }
},{
  sequelize, modelName:"schedule"
});

export default Schedule;
