import { Router } from "express";
import os from "os";
import { User, Schedule } from "../models/index.js";
import { getAllSettings,setSetting } from "../services/settingsService.js";

const r=Router();
const admin=(req,res,next)=> req.session.user?.role==="admin"?next():res.status(403).json({success:false});

// users
r.get("/api/admin/users",admin,async (_req,res)=>{
  const users=await User.findAll({order:[["createdAt","DESC"]]});
  res.json({success:true,data:users});
});
r.post("/api/admin/users/:id/role",admin,async (req,res)=>{
  const u=await User.findByPk(req.params.id); if(!u) return res.status(404).json({success:false});
  await u.update({role:req.body.role}); res.json({success:true});
});

// settings
r.get("/api/admin/settings",admin,async (_req,res)=> res.json({success:true,settings:await getAllSettings()}));
r.post("/api/admin/settings",admin,async (req,res)=>{await setSetting(req.body.key,req.body.value);res.json({success:true});});

// stats
r.get("/api/admin/stats",admin,async (_req,res)=>{
  const totalUsers=await User.count(); const totalSchedules=await Schedule.count();
  const running=await Schedule.count({where:{status:"running"}});
  const finished=await Schedule.count({where:{status:"finished"}});
  const failed=await Schedule.count({where:{status:"failed"}});
  res.json({success:true,data:{totalUsers,totalSchedules,running,finished,failed}});
});

// system info
r.get("/api/admin/system",admin,(_req,res)=>{
  const mem=os.totalmem(); const free=os.freemem();
  res.json({success:true,data:{
    hostname:os.hostname(),platform:os.platform(),arch:os.arch(),
    cpus:os.cpus().length,load:os.loadavg(),uptime:os.uptime(),
    totalMem:mem,freeMem:free,usedMem:mem-free
  }});
});

export default r;
