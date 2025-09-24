const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

// SIGNUP
router.post("/signup", async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  console.log("--- SIGNUP ATTEMPT ---");
  console.log("Received data:", { name, email, role });

  try {
    const hash = await bcrypt.hash(password, 10);
    const userResult = await db.query(
      "INSERT INTO users (name, email, password_hash, phone) VALUES ($1, $2, $3, $4) RETURNING user_id",
      [name, email, hash, phone]
    );
    const userId = userResult.rows[0].user_id;
    console.log(`✅ Step 1: User created successfully in 'users' table. New user_id is: ${userId}`);

    if (role === "owner") {
      await db.query("INSERT INTO owners (user_id, license_number) VALUES ($1, $2)", [userId, "TEMP_LICENSE"]);
      console.log(`✅ Step 2: Owner profile created in 'owners' table for user_id: ${userId}`);
    } else {
      await db.query("INSERT INTO renters (user_id, id_proof) VALUES ($1, $2)", [userId, "TEMP_ID"]);
      console.log(`✅ Step 2: Renter profile created in 'renters' table for user_id: ${userId}`);
    }

    res.json({ success: true, message: "Signup successful", user_id: userId, role });
  } catch (err) {
    console.error("❌ ERROR DURING SIGNUP:", err.message); // Log the specific error
    res.status(500).json({ success: false, error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email" });
    }
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }
    let role = "renter";
    const ownerCheck = await db.query("SELECT * FROM owners WHERE user_id = $1", [user.user_id]);
    if (ownerCheck.rows.length > 0) role = "owner";
    res.json({ success: true, message: "Login successful", user_id: user.user_id, role });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
