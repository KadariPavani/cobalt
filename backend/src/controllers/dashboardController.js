const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const dashboardService = require('../services/dashboardService');

const stats = asyncHandler(async (req, res) => {
  const data = await dashboardService.getStats(req.user.id);
  return success(res, data);
});

module.exports = { stats };
