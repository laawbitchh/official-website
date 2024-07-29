const msgModel = require("../../models/message.model");

module.exports = {
  method: "get",
  endpoint: "/messages/:from/:to",
  about: "Home page",
  exec: async (req, res) => {
    let data = [];
    data.push(
      await msgModel.find({
        from: req.params.from,
        to: req.params.to,
      })
    );

    data.push(
      await msgModel.find({
        from: req.params.to,
        to: req.params.from,
      })
    );
    let dataToSort = [];
    for (_ of data) {
      for (m of _) {
        dataToSort.push(m);
      }
    }
    dataToSort.sort((a, b) => a.sendAt - b.sendAt);
    res.json(dataToSort);
  },
};
