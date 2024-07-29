module.exports = {
  method: "get",
  endpoint: "/",
  about: "Home page",
  exec: async (req, res) => {
    res.json({
      status: "online",
    });
  },
};
