const jwt = require("jsonwebtoken");
module.exports = async function verify(token) {
  try {
    let verifyToken = jwt.verify(token, "spikeLeGoat");
    return verifyToken.data;
  } catch (err) {
    return false;
  }
};
