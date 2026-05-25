const dashboardModel = require('../models/dashboardModel');

const getStats = (userId) => dashboardModel.getStats({ userId });

module.exports = { getStats };
