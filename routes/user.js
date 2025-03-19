const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middleware");
const { User, Account } = require("../db");

const router = express.Router();

const signupBody = zod.object({
  username: zod.string().email(),
  firstName: zod.string(),
  lastName: zod.string(),
  password: zod.string(),
});

const updateBody = zod.object({
  password: zod.string().optional(),
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
});

router.post("/signup", async (req, res) => {
  const body = req.body;
  // console.log(body);
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

  console.log(newUser);

  const userId = newUser._id;

  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
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
    data: {
      user: newUser,
    },
  });
});

router.patch("/", authMiddleware, async (req, res) => {
  const { success } = updateBody.safeParse(req.body);
  if (!success) {
    res.status(411).json({
      message: "Error while updating information",
    });
  }

  const user = await User.findByIdAndUpdate(req.userId, req.body, {
    new: true,
    runValidators: true,
  });

  console.log(`authMiddleware ${req.userId}`);
  console.log(`user found: ${user}`);

  if (!user) {
    return res.status(404).json({
      message: "no user found",
    });
  }

  res.json({
    message: "Updated successfully",
    data: { user },
  });
});

router.get("/bulk", async (req, res) => {
  const filter = req.query.filter || "";

  const users = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  });

  res.json({
    user: users.map((user) => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    })),
  });
});

module.exports = router;
