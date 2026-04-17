const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(
  "mongodb+srv://steampakistan:Test123@cluster0.voufv.mongodb.net/StemClub?retryWrites=true&w=majority",
);

let db;

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log("MongoDB connected");

    db = client.db("StemClub");
  } catch (error) {
    console.error("DB connection error:", error);
  }
}

app.get("/test", async (req, res) => {
  console.log("hi this is working");

  res.send("Test route is working 🚀");
});
// 📌 API 1: Get all posts
app.get("/posts", async (req, res) => {
  try {
    const { province, district, institute, dateFrom, dateTo, status } =
      req.query;

    let query = {};

    // Basic filters
    if (province) {
      query.province = province;
    }

    if (district) {
      query.district = district;
    }

    if (institute) {
      query.institute = institute;
    }

    // Date range filter (createdAt)
    if (dateFrom || dateTo) {
      query.createdAt = {};

      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }

      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    // Status logic
    if (status) {
      if (status === "pending") {
        query.districtStatus = false;
        query.rejectedStatus = false;
      } else if (status === "approved") {
        query.districtStatus = true;
        query.rejectedStatus = false;
      } else if (status === "rejected") {
        query.districtStatus = false;
        query.rejectedStatus = true;
      }
    }

    const posts = await db.collection("posts").find(query).toArray();

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// 📌 API 2: Get all schools
app.get("/schools", async (req, res) => {
  try {
    const limit = 6000;
    const page = parseInt(req.query.page) || 1;

    const skip = (page - 1) * limit;

    const schools = await db
      .collection("schools")
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    res.json(schools);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch schools" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
