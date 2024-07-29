const userModel = require("../../models/user.model"),
  jwt = require("jsonwebtoken"),
  cryptr = require("cryptr"),
  { sendMsg } = require("../../index.js");

module.exports = {
  method: "post",
  endpoint: "/register",
  about: "Endpoint to create an account",
  exec: async (req, res) => {
    if (!req.body) {
      res.status(400).json({
        code: 400,
        status: "No body in req",
      });
      return;
    }

    let verifUsername = await userModel.find({ username: req.body.username });
    if (verifUsername.length > 0) {
      res.json({
        code: 400,
        status: "Username is already used",
      });
      return;
    }

    let newUser = new userModel({
      username: req.body.username,
      password: new cryptr("spikeLeGoat").encrypt(req.body.password),
      ip: req.body.ip,
      money: 0,
      creationTime: Date.now(),
      hasMessages: false,
    });

    newUser.save();

    let token = jwt.sign(
      {
        data: req.body.username,
      },
      "spikeLeGoat"
    );
    res.status(200).json({
      code: 200,
      status: "New user created",
      token: token,
    });

    sendMsg("Bienvenue, envoie moi un message quand tu en as l'envie !", token);
  },
};
