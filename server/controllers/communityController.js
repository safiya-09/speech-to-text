const Community = require("../models/Community");

// @desc    Get all communities
// @route   GET /api/communities
// @access  Public
const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: communities.length,
      data: communities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch communities",
    });
  }
};

// @desc    Create a new community
// @route   POST /api/communities
// @access  Public
const createCommunity = async (req, res) => {
  try {
    const { name, description, category, avatar, banner } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide a name and category",
      });
    }

    // Auto-generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if community or slug already exists
    const existingCommunity = await Community.findOne({ slug });
    if (existingCommunity) {
      return res.status(400).json({
        success: false,
        message: "A community with this name or slug already exists",
      });
    }

    const community = await Community.create({
      name,
      slug,
      description,
      category,
      avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      banner: banner || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809", // Nice gradient placeholder
    });

    res.status(201).json({
      success: true,
      data: community,
    });
  } catch (error) {
    console.error("[Community Controller Error]:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create community",
    });
  }
};

module.exports = {
  getAllCommunities,
  createCommunity,
};
