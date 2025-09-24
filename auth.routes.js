import { Router } from "express";
import { User } from "../models/index.js";
import bcrypt from "bcryptjs";

const r = Router();

// register
r.post("/api/auth/register", async (req,res)=>{
  try{
    const { name,email,password }=req.body;
    if(!name||!email||!password) return res.status(400).json({success:false,error:"Invalid"});
    const ex=await User.findOne({ where:{email}});
    if(ex) return res.status(409).json({success:false,error:"Email exist"});
    const u=await User.create({ name,email,password,role:"user" });
    req.session.user={id:u.id,name:u.name,email:u.email,role:u.role};
    res.json({success:true,user:req.session.user});
  }catch(e){res.status(500).json({success:false,error:e.message});}
});

// login
r.post("/api/auth/login", async (req,res)=>{
  try{
    const { email,password }=req.body;
    const u=await User.findOne({where:{email}});
    if(!u||!(await u.validatePassword(password))) return res.status(401).json({success:false,error:"Wrong login"});
    req.session.user={id:u.id,name:u.name,email:u.email,role:u.role};
    res.json({success:true,user:req.session.user});
  }catch(e){res.status(500).json({success:false,error:e.message});}
});

// me
r.get("/api/auth/me",(req,res)=>{
  if(!req.session.user) return res.status(401).json({success:false,error:"Unauthorized"});
  res.json({success:true,user:req.session.user});
});

// logout
r.post("/api/auth/logout",(req,res)=> req.session.destroy(()=>res.json({success:true})));

// profile update
r.put("/api/auth/profile", async (req,res)=>{
  if(!req.session.user) return res.status(401).json({success:false});
  const u=await User.findByPk(req.session.user.id); if(!u) return res.status(404).json({success:false});
  const {name,email}=req.body;
  await u.update({name,email});
  req.session.user={id:u.id,name:u.name,email:u.email,role:u.role};
  res.json({success:true,user:req.session.user});
});

// change password
r.put("/api/auth/password", async (req,res)=>{
  if(!req.session.user) return res.status(401).json({success:false});
  const u=await User.findByPk(req.session.user.id);
  const {oldPassword,newPassword}=req.body;
  if(!(await u.validatePassword(oldPassword))) return res.status(400).json({success:false,error:"Wrong old password"});
  u.password=await bcrypt.hash(newPassword,10);
  await u.save(); res.json({success:true});
});

export default r;
