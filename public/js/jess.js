const ws = new WebSocket("ws://localhost:3001");

ws.onopen = async () => {
  let msg = {
    event: "connection",
    from: "Jess",
  };

  ws.send(JSON.stringify(msg));
};

ws.onmessage = (m) => {
  console.log(m);
};

window.addEventListener("beforeunload", () => {
  let msg = {
    event: "deconnection",
    from: "Jess",
  };

  ws.send(JSON.stringify(msg));
});

let b = document.getElementById("s");

b.addEventListener("click", (e) => {
  e.preventDefault();
  let input = document.getElementById("input").value;

  let msg = {
    event: "msg",
    from: "Jess",
    to: "valentinLeBossDuGame",
    content: input,
    sendAt: Date.now(),
  };
  ws.send(JSON.stringify(msg));
});
