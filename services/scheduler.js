import { Schedule } from "../models/index.js";
import { startStream } from "./ffmpegService.js";

export function startSchedulers(){
  setInterval(async ()=>{
    const now = new Date();
    const rows = await Schedule.findAll({ where:{ status:"scheduled" }});
    for(const s of rows){
      if(s.mode==="schedule" && s.startAt && new Date(s.startAt) <= now){
        try{ await startStream(s); } catch(e){ console.error("Scheduler error",e); }
      }
    }
  }, 5000);
}
