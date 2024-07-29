const jwt = require("jsonwebtoken");

module.exports = {
  method: "get",
  endpoint: "/verify/:token",
  about: "Verify a token",
  exec: async (req, res) => {
    let verifToken = jwt.verify(req.params.token, "spikeLeGoat");
    res.status(200).json({
      code: 200,
      status: "Good token",
      data: verifToken.data,
    });
  },
};
