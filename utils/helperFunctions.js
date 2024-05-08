const User = require("../models/User");

async function getAllFCMTokens() {
  try {
    const result = await User.aggregate([
      // Unwind the fcm_token array to get individual tokens
      { $unwind: "$fcm_token" },
      // Project to output only the fcm_token field
      {
        $project: {
          _id: 0,
          fcm_token: 1,
        },
      },
    ]);

    const tokens = result.map((user) => user.fcm_token);
    return tokens;
  } catch (err) {
    throw err;
  }
}

module.exports = { getAllFCMTokens };
