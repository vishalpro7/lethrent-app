const express = require("express");
const router = express.Router();
const db = require("../db");

// Create booking
router.post("/", async (req, res) => {
  const { vehicle_id, renter_id: userId, start_date, end_date } = req.body;
  try {
    const renterQuery = await db.query(
      "SELECT renter_id FROM renters WHERE user_id = $1",
      [userId]
    );
    if (renterQuery.rows.length === 0) {
      return res.status(404).json({ error: "Renter profile not found for this user." });
    }
    const actualRenterId = renterQuery.rows[0].renter_id;

    // THE DEFINITIVE FIX:
    // The status is now set to 'confirmed' immediately upon creation.
    const result = await db.query(
      "INSERT INTO bookings (vehicle_id, renter_id, start_date, end_date, status) VALUES ($1, $2, $3, $4, 'confirmed') RETURNING *",
      [vehicle_id, actualRenterId, start_date, end_date]
    );

    // This part remains the same, marking the vehicle as unavailable.
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
        `SELECT b.*, v.brand, v.model FROM bookings b
         JOIN renters r ON b.renter_id = r.renter_id
         JOIN vehicles v ON b.vehicle_id = v.vehicle_id
         WHERE r.user_id = $1 ORDER BY b.start_date DESC`,
        [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


