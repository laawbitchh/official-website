const userModel = require("../../models/user.model"),
  axios = require("axios").default;

module.exports = {
  method: "post",
  endpoint: "/delete/:account",
  about: "Endpoint to delete an account",
  exec: async (req, res) => {
    if (!req.body) {
      res.status(400).json({
        code: 400,
        status: "No body in req",
      });
      return;
    }

    async function verify(token) {
      try {
        let res = await axios.get(`http://localhost:3000/api/verify/${token}`);

        return res.data.data;
      } catch (err) {
        return false;
      }
    }

    if ((await verify(req.headers.token)) != "Jess") {
      res.status(403).json({
        code: 403,
        status: "What are u trying to do :)",
      });
      return;
    }
    let response = await userModel.deleteOne({ username: req.params.account });
  },
};
