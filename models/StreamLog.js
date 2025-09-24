import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class StreamLog extends Model {}

StreamLog.init({
  scheduleId: DataTypes.INTEGER,
  message: DataTypes.TEXT
},{
  sequelize, modelName:"streamlog"
});

export default StreamLog;
