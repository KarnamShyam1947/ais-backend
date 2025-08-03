const Log = require('../models/LogModel');

const getAllLogs = async (req, res) => {
  try {
    const logs = await Log.find();
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving logs', error });
  }
};

const addLog = async (name, email, phone, service) => {
  try {

    const newLog = new Log({ name, email, phone, service });
    const savedLog = await newLog.save();

    return savedLog;
  } catch (error) {
    return { message: 'Error creating log', error };
  }
};

module.exports = {
  getAllLogs,
  addLog
};
