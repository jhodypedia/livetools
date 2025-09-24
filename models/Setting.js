import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

class Setting extends Model {}

Setting.init({
  key: { type: DataTypes.STRING, unique:true },
  value: DataTypes.STRING
},{
  sequelize, modelName:"setting"
});

export default Setting;
