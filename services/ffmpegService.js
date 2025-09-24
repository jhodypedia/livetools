import { spawn } from "child_process";
import EventEmitter from "events";
import { StreamLog, Schedule } from "../models/index.js";

export const streamBus = new EventEmitter();
const running = new Map();

export async function startStream(sched){
  if(running.has(sched.id)) throw new Error("Sudah jalan");

  const rtmpUrl = getRtmpUrl(sched.platform, sched.streamKey);
  if(!rtmpUrl) throw new Error("Platform tidak didukung");

  const args = [
    "-re",
    "-i", sched.sourcePath,
    "-c:v","libx264","-preset", sched.preset || "veryfast","-b:v", sched.vBitrate || "2500k",
    "-c:a","aac","-b:a", sched.aBitrate || "128k",
    "-f","flv", rtmpUrl
  ];

  const ff = spawn("ffmpeg", args);
  running.set(sched.id, ff);
  await sched.update({ status:"running" });

  ff.stdout.on("data",(d)=> log(sched.id, d.toString()));
  ff.stderr.on("data",(d)=> log(sched.id, d.toString()));
  ff.on("close", async (c)=>{
    running.delete(sched.id);
    await sched.update({ status: c===0?"finished":"failed" });
    log(sched.id, `FFmpeg exited code ${c}`);
  });
}

export async function stopStream(sched){
  const ff=running.get(sched.id);
  if(ff){ ff.kill("SIGINT"); running.delete(sched.id); await sched.update({status:"stopped"}); }
}

function log(sid,msg){
  StreamLog.create({ scheduleId: sid, message: msg });
  streamBus.emit("log",{ scheduleId:sid, message:msg });
}

function getRtmpUrl(platform,key){
  switch(platform){
    case "youtube": return `rtmp://a.rtmp.youtube.com/live2/${key}`;
    case "twitch": return `rtmp://live.twitch.tv/app/${key}`;
    case "tiktok": return `rtmp://push-rtmp-global.tiktoklive.com/live/${key}`;
    case "instagram": return `rtmp://live-upload.instagram.com:80/rtmp/${key}`;
    default: return null;
  }
}
