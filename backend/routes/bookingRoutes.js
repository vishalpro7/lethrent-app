const express = require("express");
const router = express.Router();
const db = require("../db");

// Create booking
router.post("/", async (req, res) => {
  const { vehicle_id, renter_id: userId, start_date, end_date } = req.body;

  try {
    // STEP 1: Find the actual renter_id from the user_id we received.
    const renterQuery = await db.query(
      "SELECT renter_id FROM renters WHERE user_id = $1",
      [userId]
    );

    if (renterQuery.rows.length === 0) {
      return res.status(404).json({ error: "Renter profile not found for this user." });
    }
    const actualRenterId = renterQuery.rows[0].renter_id;

    // STEP 2: Use the correct renter_id to insert the booking.
    const result = await db.query(
      "INSERT INTO bookings (vehicle_id, renter_id, start_date, end_date, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING *",
      [vehicle_id, actualRenterId, start_date, end_date]
    );

    await db.query("UPDATE vehicles SET is_available = false WHERE vehicle_id = $1", [vehicle_id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bookings of a renter
router.get("/:renter_id", async (req, res) => {
  const userId = req.params.renter_id;
  try {
    const result = await db.query(
        `SELECT b.* FROM bookings b
         JOIN renters r ON b.renter_id = r.renter_id
         WHERE r.user_id = $1`,
        [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;