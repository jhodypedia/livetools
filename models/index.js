import { sequelize } from "../config/db.js";
import User from "./User.js";
import Schedule from "./Schedule.js";
import StreamLog from "./StreamLog.js";
import Setting from "./Setting.js";

// relations
User.hasMany(Schedule, { foreignKey:"userId" });
Schedule.belongsTo(User, { foreignKey:"userId" });

Schedule.hasMany(StreamLog, { foreignKey:"scheduleId" });
StreamLog.belongsTo(Schedule, { foreignKey:"scheduleId" });

export { sequelize, User, Schedule, StreamLog, Setting };
