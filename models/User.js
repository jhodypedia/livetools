import { DataTypes, Model } from "sequelize";
import bcrypt from "bcryptjs";
import { sequelize } from "../config/db.js";

class User extends Model {
  async validatePassword(password){
    return await bcrypt.compare(password, this.password);
  }
}

User.init({
  name: { type: DataTypes.STRING, allowNull:false },
  email: { type: DataTypes.STRING, allowNull:false, unique:true },
  password: { type: DataTypes.STRING, allowNull:false },
  role: { type: DataTypes.STRING, defaultValue:"user" }
},{
  sequelize, modelName:"user"
});

User.beforeCreate(async (user)=>{
  user.password = await bcrypt.hash(user.password, 10);
});

export default User;
