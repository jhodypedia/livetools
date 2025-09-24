import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import session from "express-session";
import rateLimit from "express-rate-limit";
import expressLayouts from "express-ejs-layouts";
import { Server } from "socket.io";

import { initDB } from "./config/db.js";
import { cspDirectives } from "./config/security.js";
import { injectUser } from "./middlewares/auth.js";

import authRoutes from "./routes/auth.routes.js";
import schedulesRoutes from "./routes/schedules.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import pagesRoutes from "./routes/pages.routes.js";
import { startSchedulers } from "./services/scheduler.js";
import { streamBus } from "./services/ffmpegService.js";

dotenv.config();
process.env.TZ = "Asia/Jakarta";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// security + parsers
app.use(helmet({ contentSecurityPolicy: { useDefaults: true, directives: cspDirectives }}));
app.use(rateLimit({ windowMs: 60_000, max: 300 }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// session
app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false, saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000*60*60*12 }
}));

// inject user
app.use(injectUser);

// static
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/hls", express.static(path.join(__dirname, "hls")));

// ejs + layouts
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/main");

// routes
app.use(authRoutes);
app.use(schedulesRoutes);
app.use(adminRoutes);
app.use(pagesRoutes);

// sockets realtime log
io.on("connection", (socket) => {
  const onLog = (payload) => socket.emit("stream-log", payload);
  streamBus.on("log", onLog);
  socket.on("disconnect", () => streamBus.off("log", onLog));
});

// boot
await initDB();
startSchedulers();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
