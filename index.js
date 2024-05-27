const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require("./models/user");
const Exercise = require("./models/exercise");

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (_, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  let username = req.body.username;

  let user = await User.create({ username });

  res.json({ username: user.username, _id: user._id });
});

app.get("/api/users", async (_, res) => {
  let r = await User.find({});

  let users = r.map((user) => {
    return { username: user.username, _id: user._id };
  });

  res.json(users);
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const userId = req.params._id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.json({ error: "Invalid user id" }), 400;
  }

  let user = await User.findById(userId);

  if (!user) {
    return res.json({ error: "User not found" }), 400;
  }

  let queryCondition = { user_id: userId };

  let dateCondition = {};

  if (req.query.from || req.query.to) {
    dateCondition.$gte = req.query.from
      ? new Date(req.query.from)
      : new Date(0);
    dateCondition.$lte = req.query.to ? new Date(req.query.to) : new Date();
  }

  if (dateCondition.$gte || dateCondition.$lte) {
    queryCondition.date = dateCondition;
  }

  let r = await Exercise.find(queryCondition).limit(
    req.query.limit ? parseInt(req.query.limit) : Infinity
  );

  let logs = r.map((exercise) => {
    return {
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
    };
  });

  res.json({
    _id: user._id,
    username: user.username,
    count: logs.length,
    log: logs,
  });
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const userId = req.params._id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.json({ error: "Invalid user id" }), 400;
  }

  let user = await User.findById(userId);

  if (!user) {
    return res.json({ error: "User not found" }), 400;
  }

  let { description, duration, date } = req.body;

  let exercise = await Exercise.create({
    user_id: userId,
    description,
    duration,
    date: date ? new Date(date) : new Date(),
  });

  return res.json({
    username: user.username,
    date: exercise.date.toDateString(),
    duration: exercise.duration,
    description: exercise.description,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
