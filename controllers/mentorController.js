const db = require("../config/database");

//@desc Get all mentors
//@route GET /api/mentors
//@access public
const getMentors = (req, res) => {
    const query = "SELECT * FROM mentors";
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: "Failed to retrieve mentors" });
            return;
        }
        res.status(200).json(results);
    });
};

//@desc Create new mentor
//@route POST /api/mentors
//@access public
const createMentor = (req, res) => {
    const { name, email, areaOfExpertise } = req.body;
    if (!name || !email || !areaOfExpertise) {
        res.status(400).json({ error: "All fields are mandatory!" });
        return;
    }

    const query = "INSERT INTO mentors (name, email, areaOfExpertise) VALUES (?, ?, ?)";
    db.query(query, [name, email, areaOfExpertise], (err, result) => {
        if (err) {
            res.status(500).json({ error: "Failed to create mentor" });
            return;
        }
        res.status(201).json({ message: "Mentor created", mentorId: result.insertId });
    });
};

module.exports = { getMentors, createMentor };
