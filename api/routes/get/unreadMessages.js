const modalMessage = require("../../models/message.model");

module.exports = {
  method: "get",
  endpoint: "/unreadMessages/:username",
  about: "Endpoint to get unread messages from an username",
  exec: async (req, res) => {
    try {
      const messages = await modalMessage.find({
        to: "Jess",
        from: req.params.username,
        read: false,
      });
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unread messages" });
    }
  },
};
