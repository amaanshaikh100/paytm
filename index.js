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
const DB = process.env.MONGO_URL;
mongoose.connect(DB).then(() => console.log("connect to DB successfully..."));

// API ENDPOINTS
app.use("/api/v1", mainRouter);

// SERVER CONNECTION
const port = 6000;
app.listen(port, (req, res) => {
  console.log(`connected on port ${port}...`);
});
