const express = require("express");
const {
  getAllCommunities,
  createCommunity,
} = require("../controllers/communityController");

const router = express.Router();

// GET /api/communities
router.get("/", getAllCommunities);

// POST /api/communities
router.post("/", createCommunity);

module.exports = router;
