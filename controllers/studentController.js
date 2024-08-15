const {db} = require("../config/database");

//@desc Get all students
//@route GET /api/students
//@access public
const getStudents = async (req, res) => {
    const query = "SELECT * FROM students";
    db.query(query, (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: "Failed to retrieve students" });
            return;
        }
        console.log(results);
        res.status(200).json(results);
    });
};

//@desc Create new student
//@route POST /api/students
//@access public
const createStudent = (req, res) => {
    const { name, email, areaOfInterest } = req.body;
    if (!name || !email || !areaOfInterest) {
        res.status(400).json({ error: "All fields are mandatory!" });
        return;
    }

    const query = "INSERT INTO students (name, email, areaOfInterest) VALUES (?, ?, ?)";
    db.query(query, [name, email, areaOfInterest], (err, result) => {
        if (err) {
            res.status(500).json({ error: "Failed to create student" });
            return;
        }
        res.status(201).json({ message: "Student created", studentId: result.insertId });
    });
};

module.exports = { getStudents, createStudent };
