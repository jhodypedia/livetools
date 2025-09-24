import { Router } from "express";
const r=Router();

const guard=(req,res,next)=> req.me?next():res.redirect("/");
const adminOnly=(req,res,next)=> req.me?.role==="admin"?next():res.redirect("/dashboard");

r.get("/",(req,res)=> req.me?res.redirect("/dashboard"):res.render("pages/login",{title:"Login"}));
r.get("/dashboard",guard,(req,res)=> res.render("pages/dashboard",{title:"Dashboard"}));
r.get("/newlive",guard,(req,res)=> res.render("pages/newlive",{title:"New Live"}));
r.get("/history",guard,(req,res)=> res.render("pages/history",{title:"History"}));
r.get("/settings",guard,(req,res)=> res.render("pages/settings",{title:"Settings"}));

r.get("/admin",guard,adminOnly,(req,res)=> res.render("pages/admin",{title:"Admin"}));
r.get("/admin/system",guard,adminOnly,(req,res)=> res.render("pages/system",{title:"System"}));

export default r;
