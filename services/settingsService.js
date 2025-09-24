import { Setting } from "../models/index.js";

export async function getAllSettings(){
  const rows = await Setting.findAll();
  const obj={}; rows.forEach(s=> obj[s.key]=s.value);
  return obj;
}

export async function setSetting(key,value){
  const row = await Setting.findOne({ where:{ key }});
  if(row){ await row.update({ value }); } else { await Setting.create({ key,value }); }
}
