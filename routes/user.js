const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { User } = require("../db");

const router = express.Router();

const signupBody = zod.object({
  username: zod.string().email(),
  firstName: zod.string(),
  lastName: zod.string(),
  password: zod.string(),
});

router.post("/signup", async (req, res) => {
  const body = req.body;
  const { success } = signupBody.safeParse(req.body);

  if (!success) {
    return res.json({
      message: "Email alredy taken / Incorrect Inputs",
    });
  }

  const user = await User.findOne({
    username: body.username,
  });

  if (user) {
    return res.status(411).json({
      message: "Email already taken/Incorrect inputs",
    });
  }

  const newUser = await User.create({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  });

  const token = jwt.sign(
    {
      id: newUser._id,
    },
    process.env.JWT_SECRET
  );

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    token: token,
  });
});

module.exports = router;
