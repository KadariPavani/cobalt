const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const userModel = require('../models/userModel');

const list = asyncHandler(async (_req, res) => {
  const users = await userModel.listAll();
  return success(res, {
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatarUrl: u.avatar_url,
    })),
  });
});

module.exports = { list };
