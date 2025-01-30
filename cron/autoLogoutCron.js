const cron = require("node-cron");
const User = require("../models/models_schema").User;

const autoLogout = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      await User.updateMany(
        { role: "staff" },
        { $set: { currentSessionToken: null } }
      );
      console.log("Auto logout completed for staff");
    } catch (err) {
      console.error("Error during auto logout:", err);
    }
  });
};

module.exports = autoLogout;
