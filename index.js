const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// ROUTER
const mainRouter = require("./routes/index");

const app = express();

// MIDDLEWARES
app.use(express.json());
app.use(cors());

// READING .env file
dotenv.config({ path: "./config.env" });

// DB CONNECTION
const DB = process.env.DB_URL;
mongoose.connect(DB).then(() => console.log("connect to DB successfully..."));

// API ENDPOINTS
app.use("/api/v1", mainRouter);

app.post("/signin", (req, res) => {
  res.status(201).json({
    status: "success",
    message: "<Signin>",
  });
});

app.post("/me", (req, res) => {
  res.status(201).json({
    status: "success",
    message: "<Update data>",
  });
});

// SERVER CONNECTION
const port = 6000;
app.listen(port, (req, res) => {
  console.log(`connected on port ${port}...`);
});
