import { User } from "../models/index.js";

export async function injectUser(req,res,next){
  if(req.session.user){
    req.me = req.session.user;
  } else {
    req.me = null;
  }
  res.locals.me = req.me;
  next();
}
