// Obtention du nom d'utilisateur à partir des paramètres d'URL ou du chemin
const urlParams = new URLSearchParams(window.location.search);
let username = window.location.pathname.split("/").pop();
document.getElementById("username").textContent = username;
document.title = `Jessica Rhoades | Chat avec ${username}`;

// Connexion WebSocket
const ws = new WebSocket("ws://localhost:3001");

ws.onopen = () => {
  let msg = {
    event: "connection",
    from: "Jess",
  };
  ws.send(JSON.stringify(msg));
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.event === "msg") {
    addMessageToChat(msg.content, "other");
  }
};

window.addEventListener("beforeunload", () => {
  let msg = {
    event: "deconnection",
    from: "Jess",
  };
  ws.send(JSON.stringify(msg));
});

document
  .getElementById("messageInput")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (message) {
    addMessageToChat(message, "user");

    const msg = {
      event: "msg",
      from: "Jess",
      to: username,
      content: message,
      sendAt: Date.now(),
    };
    ws.send(JSON.stringify(msg));

    input.value = "";
  }
}

async function getMessages() {
  let res = await axios.get(
    `http://localhost:3000/api/messages/Jess/${username}`
  );
  let data = res.data;
  for (msg of data) {
    switch (msg.from) {
      case "Jess":
        addMessageToChat(msg.content, "user");
        break;
      case username:
        addMessageToChat(msg.content, "other");
    }
  }

  let readMsg = {
    event: "read",
    from: "Jess",
    to: username,
  };
  ws.send(JSON.stringify(readMsg));
}

function addMessageToChat(message, type) {
  const chatArea = document.getElementById("chatArea");
  const newMessage = document.createElement("div");
  newMessage.classList.add("message", type);
  newMessage.textContent = message;
  chatArea.appendChild(newMessage);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// Optionnel : récupérez les messages existants lors du chargement
getMessages();
