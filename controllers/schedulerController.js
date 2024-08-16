const { db } = require("../config/database");

// @desc Schedule 1x1 session
// @route GET /api/scheduler
// @access Public
const getMentorSession = (req, res) => {
  const { role, duration } = req.query;  // Extract 'role' and 'duration' from query parameters
  const query = `
    SELECT * FROM mentors As m
    JOIN session_slot AS ss ON m.mentorId = ss.mentorId
    WHERE m.role = "${role}" AND ss.duration = ${duration};
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to retrieve session" });  // Send error response if query fails
      return;
    }
    console.log(results);  // Log query results
    res.status(200).json(results);  // Send query results as response
  });
};

// @desc Schedule a session based on availability and premium status
// @route POST /api/scheduler
// @access Public
const scheduleSession = (req, res) => {
  const { rollno, mentorId, duration, role, premium, session_slot } = req.body;  // Extract details from request body

  if (premium === "no" && !mentorId) {
    // Non-premium auto-booking: Check mentor availability
    const checkAvailabilityQuery = `
      SELECT * FROM mentors AS m
      JOIN session_slot AS ss ON m.mentorId = ss.mentorId
      WHERE ss.is_available = 1 AND m.role = "${role}" AND ss.duration = ${duration}
      ORDER BY session_id ASC
      LIMIT 1;
    `;
    
    db.query(checkAvailabilityQuery, (err, Mentorresults) => {
      if (err) {
        res.status(500).json({ error: "Failed to check mentor's availability", err });  // Handle error in availability check
        return;
      }

      if (Mentorresults.length) {
        // Mentor is available, proceed with booking
        const priceQuery = `SELECT * FROM payment_types WHERE type = ${duration};`;
        
        db.query(priceQuery, (err, result) => {
          if (err) {
            res.status(500).json({ error: "Failed to fetch payment type" });  // Handle error in fetching payment type
            return;
          }

          // Insert session booking details
          const insertSessionQuery = `
            INSERT INTO bookings (rollno, mentorId, payment_status, session_slot_id, premium)
            VALUES (${rollno}, ${Mentorresults[0].mentorId}, "Completed", ${Mentorresults[0].session_id}, "${premium}");
          `;
          
          db.query(insertSessionQuery, (err, bookresult) => {
            if (err) {
              res.status(500).json({ error: "Failed to schedule session" });  // Handle error in session scheduling
              return;
            }

            // Update session slot to mark it as unavailable
            const updateSessionQuery = `UPDATE session_slot SET is_available = 0 WHERE session_id = ${Mentorresults[0].session_id};`;
            
            db.query(updateSessionQuery, (err, resp) => {
              if (err) {
                res.status(500).json({ error: "Failed to update slot availability" });  // Handle error in updating availability
                return;
              }
              console.log("Slot availability updated");  // Log slot update success
            });

            // Insert payment record
            const base_price = result[0].price;
            const total_price = base_price + (0.18 * base_price);  // Calculate total price including tax
            console.log("TOTAL PRICE", total_price);  // Log total price
            
            const paymentUpdateQuery = `
              INSERT INTO payments (booking_id, amount, payment_status, payment_type_id)
              VALUES (${bookresult.insertId}, ${total_price}, "Completed", ${result[0].payment_type_id});
            `;
            
            db.query(paymentUpdateQuery, (err, resp) => {
              if (err) {
                res.status(500).json({ error: "Failed to update payment table" });  // Handle error in payment update
                return;
              }
              console.log("Payment updated");  // Log payment update success
            });

            res.status(201).json({
              message: "Session scheduled",  // Send success response
              sessionId: bookresult.insertId,
            });
          });
        });
      } else {
        // Mentor not available
        res.status(400).json({ error: "Mentor is not available at the requested time" });  // Send mentor unavailable response
      }
    });
  } else {
    // Premium booking condition: Check specific slot availability
    const checkAvailabilityQuery = `
      SELECT * FROM mentors AS m
      JOIN session_slot AS ss ON m.mentorId = ss.mentorId
      WHERE ss.is_available = 1 AND m.role = "${role}" AND ss.duration = ${duration} AND ss.session_id = ${session_slot};
    `;
    
    db.query(checkAvailabilityQuery, (err, result) => {
      if (!result.length) {
        return res.status(500).json({ error: "Slot not available" });  // Handle unavailable slot
      }

      const priceQuery = `SELECT * FROM payment_types WHERE type = ${duration};`;

      db.query(priceQuery, (err, priceresult) => {
        if (err) {
          res.status(500).json({ error: "Failed to fetch payment type" });  // Handle error in fetching payment type
          return;
        }

        // Insert session booking for premium service
        const insertSessionQuery = `
          INSERT INTO bookings (rollno, mentorId, payment_status, session_slot_id, premium)
          VALUES (${rollno}, ${mentorId}, "Completed", ${session_slot}, "${premium}");
        `;
        
        db.query(insertSessionQuery, (err, bookresult) => {
          if (err) {
            res.status(500).json({ error: "Failed to schedule session" });  // Handle error in session scheduling
            return;
          }

          // Update session slot to mark it as unavailable
          const updateSessionQuery = `UPDATE session_slot SET is_available = 0 WHERE session_id = ${session_slot};`;
          
          db.query(updateSessionQuery, (err, resp) => {
            if (err) {
              res.status(500).json({ error: "Failed to update slot availability" });  // Handle error in updating availability
              return;
            }
            console.log("Slot availability updated");  // Log slot update success
          });

          // Insert payment record
          const base_price = priceresult[0].price;
          const total_price = base_price + 1000 + (0.18 * base_price);  // Calculate total price including premium charge and tax
          console.log("TOTAL PRICE", total_price);  // Log total price
          
          const paymentUpdateQuery = `
            INSERT INTO payments (booking_id, amount, payment_status, payment_type_id)
            VALUES (${bookresult.insertId}, ${total_price}, "Completed", ${result[0].payment_type_id});
          `;
          
          db.query(paymentUpdateQuery, (err, resp) => {
            if (err) {
              res.status(500).json({ error: "Failed to update payment table" });  // Handle error in payment update
              return;
            }
            console.log("Payment updated");  // Log payment update success
          });

          res.status(201).json({
            message: "Session scheduled",  // Send success response
            sessionId: bookresult.insertId,
          });
        });
      });
    });
  }
};

module.exports = { getMentorSession, scheduleSession };
