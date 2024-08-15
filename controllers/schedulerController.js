const { db } = require("../config/database");

//@desc Schedule 1x1 session
//@route get /api/scheduler
//@access public
const getMentorSession = (req, res) => {
  const { role, duration } = req.query;
  const query = `
    SELECT * FROM mentors As m
    JOIN session_slot AS ss ON m.mentorId = ss.mentorId
    WHERE m.role = "${role}" AND ss.duration = ${duration};
        `;
  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to retrieve session" });
      return;
    }
    console.log(results);
    res.status(200).json(results);
  });
};

const scheduleSession = (req, res) => {
  const { rollno, mentorId, duration, role, premium, session_slot } = req.body;

  // Query to check mentor's availability
  
  if (premium === "no" && !mentorId) {
      const checkAvailabilityQuery = `
            SELECT * FROM mentors AS m
            JOIN session_slot AS ss ON m.mentorId = ss.mentorId
            WHERE ss.is_available = 1 AND m.role = "${role}" AND ss.duration = ${duration}
            ORDER BY session_id ASC
            LIMIT 1;`;
    // System auto-book for non-premium feature
    db.query(checkAvailabilityQuery, (err, Mentorresults) => {
      if (err) {
        res
          .status(500)
          .json({ error: "Failed to check mentor's availability", err });
        return;
      }

      if (Mentorresults.length) {
        // Get price based on duration
        const priceQuery = `SELECT * FROM payment_types WHERE type = ${duration};`;
        db.query(priceQuery, (err, result) => {
          if (err) {
            res.status(500).json({ error: "Failed to fetch payment type" });
            return;
          }

          // Insert session booking
          const insertSessionQuery = `
                        INSERT INTO bookings (rollno, mentorId, payment_status, session_slot_id, premium)
                        VALUES (${rollno}, ${Mentorresults[0].mentorId}, "Completed", ${Mentorresults[0].session_id}, "${premium}");`;
          db.query(insertSessionQuery, (err, bookresult) => {
            console.log(bookresult);
            if (err) {
              res.status(500).json({ error: "Failed to schedule session" });
              return;
            }

            // Update session slot availability
            const updateSessionQuery = `UPDATE session_slot SET is_available = 0 WHERE session_id = ${Mentorresults[0].session_id};`;
            db.query(updateSessionQuery, (err, resp) => {
              if (err) {
                res
                  .status(500)
                  .json({ error: "Failed to update slot availability" });
                return;
              }
              console.log("Slot availability updated");
            });

            // Insert payment record
            const base_price = result[0].price;
            const total_price = base_price + (0.18 * base_price); // Adding 18% tax
            console.log("TOTAL PRICE",total_price);
            const paymentUpdateQuery = `
                            INSERT INTO payments (booking_id, amount, payment_status, payment_type_id)
                            VALUES (${bookresult.insertId}, ${total_price}, "Completed", ${result[0].payment_type_id});`;
            db.query(paymentUpdateQuery, (err, resp) => {
              if (err) {
                res
                  .status(500)
                  .json({ error: "Failed to update payment table" });
                return;
              }
              console.log("Payment updated");
            });

            res
              .status(201)
              .json({
                message: "Session scheduled",
                sessionId: bookresult.insertId,
              });
          });
        });
      } else {
        res
          .status(400)
          .json({ error: "Mentor is not available at the requested time" });
      }
    });
  } else {
    // Premium booking condition
    // Get price based on duration
    const checkAvailabilityQuery = `
    SELECT * FROM mentors AS m
    JOIN session_slot AS ss ON m.mentorId = ss.mentorId
    WHERE ss.is_available = 1 AND m.role = "${role}" AND ss.duration = ${duration} AND ss.session_id = ${session_slot}
    `;
    db.query(checkAvailabilityQuery,(err,result)=>{
        // console.log("hello",result)
        if(!result.length){
            return res.status(500).json({
                error: "Slot not available"
            });
        }
        const priceQuery = `SELECT * FROM payment_types WHERE type = ${duration};`;
        db.query(priceQuery, (err, priceresult) => {
          if (err) {
            res.status(500).json({ error: "Failed to fetch payment type" });
            return;
          }
          // Insert session booking for premium service
          const insertSessionQuery = `
                    INSERT INTO bookings (rollno, mentorId, payment_status, session_slot_id, premium)
                    VALUES (${rollno}, ${mentorId}, "Completed", ${session_slot}, "${premium}");`;
          db.query(insertSessionQuery, (err, bookresult) => {
            if (err) {
              res.status(500).json({ error: "Failed to schedule session" });
              return;
            }
    
            // Update session slot availability
            const updateSessionQuery = `UPDATE session_slot SET is_available = 0 WHERE session_id = ${session_slot};`;
            db.query(updateSessionQuery, (err, resp) => {
              if (err) {
                res
                  .status(500)
                  .json({ error: "Failed to update slot availability" });
                return;
              }
              console.log("Slot availability updated");
            });
    
            // Insert payment record
            const base_price = priceresult[0].price;
          const total_price = base_price + 1000 + (0.18 * base_price); // Adding 18% tax and premium charge
          console.log("TOTAL PRICE",total_price);
    
            const paymentUpdateQuery = `
                        INSERT INTO payments (booking_id, amount, payment_status, payment_type_id)
                        VALUES (${bookresult.insertId}, ${total_price}, "Completed", ${result[0].payment_type_id});`;
            db.query(paymentUpdateQuery, (err, resp) => {
              if (err) {
                res.status(500).json({ error: "Failed to update payment table" });
                return;
              }
              console.log("Payment updated");
            });
    
            res
              .status(201)
              .json({
                message: "Session scheduled",
                sessionId: bookresult.insertId,
              });
          });
        });
    });
  }
};

module.exports = { getMentorSession, scheduleSession };
