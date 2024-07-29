const verify = require("../../utils/verify"),
  fs = require("fs");

module.exports = {
  method: "get",
  endpoint: "/photo/:id",
  about: "Endpoint to get a photo",
  exec: async (req, res) => {
    if (!req.body) {
      res.status(400).json({
        code: 400,
        status: "No body in req",
      });
      return;
    }

    let verifToken = await verify(req.body.token);
    if (verifToken == false) {
      res.status(403).json({
        code: 403,
        status: "Wrong token",
      });
      return;
    } else {
      try {
        var img = fs.readFileSync(`./${req.params.id}.jpg`);
        res.contentType("image/jpeg");
        res.send(img);
      } catch (err) {
        res.send("No image with this id");
      }
    }
  },
};
