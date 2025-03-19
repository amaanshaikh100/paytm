const express = require("express");
const { authMiddleware } = require("../middleware");
const { Account } = require("../db");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
  const account = await Account.findOne({
    userId: req.userId,
  });

  res.status(200).json({
    balance: account.balance,
  });
});

router.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession(); // Start a session

  try {
    session.startTransaction(); // Start a transaction

    const { amount, to } = req.body;

    // Fetch the sender's account within the session
    const fromAccount = await Account.findOne({ userId: req.userId }).session(
      session
    );
    if (!fromAccount || fromAccount.balance < amount) {
      await session.abortTransaction(); // Abort transaction if insufficient balance
      return res.status(400).json({
        message: "Insufficient balance",
      });
    }

    // Fetch the receiver's account within the session
    const toAccount = await Account.findOne({ userId: to }).session(session);
    if (!toAccount) {
      await session.abortTransaction(); // Abort transaction if receiver account doesn't exist
      return res.status(400).json({
        message: "Invalid account",
      });
    }

    // Deduct amount from sender's account
    await Account.updateOne(
      { userId: req.userId },
      { $inc: { balance: -amount } }
    ).session(session);

    // Add amount to receiver's account
    await Account.updateOne(
      { userId: to },
      { $inc: { balance: amount } }
    ).session(session);

    // Commit the transaction
    await session.commitTransaction();
    res.json({
      message: "Transfer successful",
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    console.error("Transaction failed:", error);
    res.status(500).json({
      message: "Transaction failed",
      error: error.message,
    });
  } finally {
    // End the session
    session.endSession();
  }
});
module.exports = router;
