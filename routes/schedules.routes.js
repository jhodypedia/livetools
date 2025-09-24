import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { Schedule, StreamLog } from "../models/index.js";
import { startStream, stopStream } from "../services/ffmpegService.js";

const r=Router();
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

const upload=multer({dest:path.join(__dirname,"../uploads")});

// list
r.get("/api/schedules",async (req,res)=>{
  if(!req.session.user) return res.status(401).json({success:false});
  const where=req.session.user.role==="admin"?{}:{userId:req.session.user.id};
  if(req.query.history) where.status=["finished","failed","stopped"];
  const rows=await Schedule.findAll({where,order:[["createdAt","DESC"]]});
  res.json({success:true,data:rows});
});

// stats
r.get("/api/schedules/stats",async (req,res)=>{
  if(!req.session.user) return res.status(401).json({success:false});
  const uid=req.session.user.id;
  const total=await Schedule.count({where:{userId:uid}});
  const running=await Schedule.count({where:{userId:uid,status:"running"}});
  const success=await Schedule.count({where:{userId:uid,status:"finished"}});
  const error=await Schedule.count({where:{userId:uid,status:"failed"}});
  res.json({success:true,data:{total,running,success,error}});
});

// create
r.post("/api/schedules",upload.single("sourceFile"),async (req,res)=>{
  if(!req.session.user) return res.status(401).json({success:false});
  const b=req.body;
  let sourcePath=b.sourcePath||null; if(req.file) sourcePath=req.file.path;
  if(!sourcePath) return res.status(400).json({success:false,error:"No source"});
  const sched=await Schedule.create({
    userId:req.session.user.id,title:b.title,platform:b.platform,streamKey:b.streamKey,
    sourceType:"file",sourcePath,vBitrate:b.vBitrate,aBitrate:b.aBitrate,preset:b.preset,fps:b.fps,
    loop:b.loop==="true",mode:b.mode,startAt:b.startAt||null,timezone:b.timezone,clientTimeISO:b.clientTimeISO,
    userAgent:req.headers["user-agent"],status:(b.mode==="now"?"running":"scheduled")
  });
  if(sched.mode==="now"){ try{await startStream(sched);}catch(e){return res.status(400).json({success:false,error:e.message});} }
  res.json({success:true,schedule:sched});
});

// detail
r.get("/api/schedules/:id",async (req,res)=>{
  const s=await Schedule.findByPk(req.params.id); if(!s) return res.status(404).json({success:false});
  res.json({success:true,data:s});
});

// delete
r.delete("/api/schedules/:id",async (req,res)=>{
  const s=await Schedule.findByPk(req.params.id); if(!s) return res.status(404).json({success:false});
  await s.destroy(); res.json({success:true});
});

// start
r.post("/api/schedules/:id/start",async (req,res)=>{
  const s=await Schedule.findByPk(req.params.id); if(!s) return res.status(404).json({success:false});
  try{await startStream(s); res.json({success:true});}catch(e){res.status(400).json({success:false,error:e.message});}
});

// stop
r.post("/api/schedules/:id/stop",async (req,res)=>{
  const s=await Schedule.findByPk(req.params.id); if(!s) return res.status(404).json({success:false});
  await stopStream(s); res.json({success:true});
});

// logs
r.get("/api/schedules/:id/logs",async (req,res)=>{
  const rows=await StreamLog.findAll({where:{scheduleId:req.params.id},order:[["createdAt","DESC"]],limit:50});
  res.json({success:true,data:rows});
});

export default r;
