const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
bodyParser.urlencoded({ extended: false });
bodyParser.json();

app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/mentors", require("./routes/mentorRoutes"));
app.use("/api/scheduler", require("./routes/schedulerRoutes"));



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
