const userModel = require("./models/user.model");

const fs = require("fs"),
  express = require("express"),
  app = express(),
  cors = require("cors"),
  path = require("path"),
  mongoose = require("mongoose"),
  mongoUri =
    "mongodb+srv://laaw:mongoDatabase@cluster0.gsmtxwa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  verify = require("./utils/verify"),
  modalMessage = require("./models/message.model"),
  clients = [];

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

const loadEndpoints = (path = "./routes") => {
  fs.readdirSync(path).forEach((dirs) => {
    const dir = fs
      .readdirSync(`${path}/${dirs}`)
      .filter((files) => files.endsWith(".js"));
    for (const file of dir) {
      const route = require(`${path}/${dirs}/${file}`);
      const { method, endpoint, exec } = route;
      app[method](`/api${endpoint}`, async (req, res) => {
        await exec(req, res);
      });
      console.log(`Loaded endpoint: ${endpoint}`);
    }
  });
};

const loadApi = (port) => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

const loadDatabase = async (url) => {
  try {
    await mongoose.connect(url);
    console.log("Database connected!");
  } catch (err) {
    console.error("Database connection error:", err);
  }
};

const loadWsServer = () => {
  const server = require("http").Server(app);
  const ws = require("ws");
  const wss = new ws.Server({ server });

  wss.on("connection", async (ws) => {
    ws.on("message", async (message) => {
      const data = JSON.parse(message);

      switch (data.event) {
        case "connection":
          clients[data.from] = ws;
          if (data.from === "Jess") {
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === ws.OPEN) {
                client.send(JSON.stringify({ event: "ownerConnection" }));
              }
            });
          }
          break;
        case "msg":
          const msg = new modalMessage(data);
          msg.save();
          if (clients[data.to] && clients[data.to].readyState === ws.OPEN) {
            clients[data.to].send(JSON.stringify(data));
          }
          break;
        case "read":
          // Mark messages as read
          await modalMessage.updateMany(
            { from: data.to, to: "Jess", read: false },
            { $set: { read: true } }
          );
          await modalMessage.updateMany(
            { from: "Jess", to: data.to, read: false },
            { $set: { read: true } }
          );
          break;
        case "deconnection":
          if (data.from === "Jess") {
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === ws.OPEN) {
                client.send(JSON.stringify({ event: "ownerDeconnection" }));
              }
            });
          }
          delete clients[data.from];
          break;
        case "ownConnection":
          const connectionStatus = clients["Jess"] ? true : false;
          clients[data.from].send(
            JSON.stringify({ event: "ownConnection", data: connectionStatus })
          );
          break;
      }
    });

    ws.on("close", () => {
      // Handle connection close
    });
  });

  server.listen(3001);
};

const loadPages = () => {
  app.use(express.static(path.join(__dirname, "../public")));

  const pages = {
    "/home": "home.html",
    "/login": "login.html",
    "/register": "register.html",
    "/panel": "panel.html",
    "/chat": "chat.html",
    "/panel-chat/:username": "panel-chat.html",
  };

  Object.entries(pages).forEach(([route, file]) => {
    app.get(route, (req, res) => {
      res.sendFile(path.join(__dirname, `../public/pages/${file}`));
    });
  });
};

module.exports.sendMsg = async (msg, token) => {
  let username = await verify(token);

  const message = new modalMessage({
    from: "Jess",
    to: username,
    content: msg,
    sendAt: new Date(),
  });
  message.save();
};

console.clear();
loadApi(3000);
loadEndpoints();
loadDatabase(mongoUri);
loadWsServer();
loadPages();
