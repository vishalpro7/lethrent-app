const express = require("express");
const router = express.Router();
const db = require("../db");

// THE FIX: Get ALL vehicles, not just available ones. We will handle status on the frontend.
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM vehicles ORDER BY vehicle_id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new vehicle (for owners)
router.post("/", async (req, res) => {
  const { owner_id: userId, brand, model, reg_number, price_per_day } = req.body;
  try {
    const ownerQuery = await db.query(
      "SELECT owner_id FROM owners WHERE user_id = $1",
      [userId]
    );
    if (ownerQuery.rows.length === 0) {
      return res.status(404).json({ error: "Owner profile not found for this user." });
    }
    const actualOwnerId = ownerQuery.rows[0].owner_id;
    const result = await db.query(
      "INSERT INTO vehicles (owner_id, brand, model, reg_number, price_per_day) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [actualOwnerId, brand, model, reg_number, price_per_day]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all vehicles for a specific owner (for the dashboard)
router.get("/owner/:owner_id", async (req, res) => {
    const userId = req.params.owner_id;
  try {
    const result = await db.query(
        `SELECT v.* FROM vehicles v
         JOIN owners o ON v.owner_id = o.owner_id
         WHERE o.user_id = $1 ORDER BY v.vehicle_id ASC`,
        [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

