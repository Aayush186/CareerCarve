const {db} = require("../config/database");

//@desc Get all students
//@route GET /api/students
//@access public
const getStudents = (req, res) => {
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
    const { name, rollno, role } = req.body;
    if (!name || !rollno || !role) {
        res.status(400).json({ error: "All fields are mandatory!" });
        return;
    }

    const query = "INSERT INTO students (name, rollno, role) VALUES (?, ?, ?)";
    db.query(query, [name, rollno, role], (err, result) => {
        if (err) {
            res.status(500).json({ error: "Failed to create student" });
            console.log(err.stack)
            return;
        }
        res.status(201).json({ message: "Student created" });
    });
};

module.exports = { getStudents, createStudent };