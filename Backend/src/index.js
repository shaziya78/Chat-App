import express from "express";
import dotenv from "dotenv";
import authRoutes from "../src/routes/auth.route.js";
import messageRoutes from "../src/routes/message.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import path from 'path';
import cors from "cors";
import {app,server} from '../../Backend/src/lib/socket.js'


// Configure environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const __dirname=path.resolve();
// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Connect to MongoDB before starting the server
(async () => {
  try {
    await connectDB(); // Ensure DB connection is successful
    console.log("Database connected successfully.");

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/messages", messageRoutes);

     if(process.env.NODE_ENV==="production"){
      app.use(express.static(path.join(__dirname,"../Frontend/build")));

      app.get("*",(req,res)=>{
        res.sendFile(path.join(__dirname,"../Frontend","build","index.html"));
      })
     }
    // Handle unmatched routes (404)
    app.use((req, res) => {
      res.status(404).json({ message: "Route not found" });
    });

    // Global error-handling middleware
    app.use((err, req, res, next) => {
      console.error("Global error:", err.message);
      res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
      });
    });

    // Start the server
    server.listen(PORT, () => {
      console.log(`Server is running on PORT: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error.message);
    process.exit(1); // Exit the process if DB connection fails
  }
})();
