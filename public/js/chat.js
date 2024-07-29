if (!localStorage.getItem("token")) {
  window.location.href = "/login";
} else {
  const ws = new WebSocket("ws://localhost:3001");
  const token = localStorage.getItem("token");
  let lastMessageTime = null;

  ws.onopen = async () => {
    let msg = {
      event: "connection",
      from: await getUsername(),
    };
    ws.send(JSON.stringify(msg));

    let own = {
      event: "ownConnection",
      from: await getUsername(),
    };
    ws.send(JSON.stringify(own));
  };

  ws.onmessage = async (msg) => {
    let data = JSON.parse(msg.data);
    if (data.event == "msg") {
      try {
        let lastDir = document.querySelectorAll(".container .message-sample")[0]
          .classList[1];
        if (lastDir == "right") {
          createMessage("left", data.content, true);
        } else {
          createMessage("left", data.content, false);
        }
      } catch (e) {
        createMessage("left", data.content, true);
      }

      let container = document.querySelectorAll(".container .message-sample");
      let index = 0;

      while (container[index].classList[1] == "left") {
        index++;
      }

      if (index == 2) {
        container[0].querySelector(
          ".message-content"
        ).style.borderTopLeftRadius = "2px";
        container[1].querySelector(
          ".message-content"
        ).style.borderBottomLeftRadius = "2px";
      } else if (index >= 3) {
        container[0].querySelector(
          ".message-content"
        ).style.borderTopLeftRadius = "2px";
        container[index - 1].querySelector(
          ".message-content"
        ).style.borderBottomLeftRadius = "2px";

        for (i = 1; i < index - 1; i++) {
          container[i].querySelector(
            ".message-content"
          ).style.borderTopLeftRadius = "2px";
          container[i].querySelector(
            ".message-content"
          ).style.borderBottomLeftRadius = "2px";
        }
      }
    }

    if (data.event == "ownerConnection") {
      updateStatusIndicator("En ligne", "green");
    }

    if (data.event == "ownerDeconnection") {
      updateStatusIndicator("Hors ligne", "red");
    }

    if (data.event == "ownConnection") {
      updateStatusIndicator(
        data.data ? "En ligne" : "Hors ligne",
        data.data ? "green" : "red"
      );
    }
  };

  const getUsername = async () => {
    try {
      let resp = await axios.get(`http://localhost:3000/api/verify/${token}`);
      return resp.data.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du nom d'utilisateur:",
        error
      );
      return null;
    }
  };

  function updateStatusIndicator(textContent, color) {
    const textElement = document.querySelector(".status-text");
    const dotElement = document.querySelector(".status-dot");

    if (textElement.textContent != textContent) {
      textElement.textContent = textContent;
      dotElement.style.backgroundColor = color;
    }
  }

  function createDate(date) {
    const container = document.querySelector(".container");
    const dateContent = document.createElement("div");
    dateContent.classList.add("date");

    const text = document.createElement("p");
    text.textContent = date;
    text.style.margin = "0"; // Supprime la marge par défaut de l'élément <p>
    dateContent.appendChild(text);

    if (container.firstChild) {
      container.insertBefore(dateContent, container.firstChild);
    } else {
      container.appendChild(dateContent);
    }
  }

  function createMessage(side, text, hasProfilePic) {
    const container = document.querySelector(".container");
    const messageSample = document.createElement("div");
    messageSample.classList.add("message-sample", side);

    if (hasProfilePic) {
      const profileContainer = document.createElement("div");
      profileContainer.classList.add("profile-container");

      const profilePicture = document.createElement("img");
      profilePicture.src = "../src/pdp-jess.jpg"; // Remplacez par l'URL de votre image de profil
      profilePicture.alt = "Profile Picture";
      profilePicture.classList.add("profile-picture");

      profileContainer.appendChild(profilePicture);
      messageSample.appendChild(profileContainer);
    }

    const messageContent = document.createElement("div");
    messageContent.classList.add("message-content");

    const messageText = document.createElement("p");
    messageText.classList.add("message-text");
    messageText.textContent = text;

    messageContent.appendChild(messageText);
    messageSample.appendChild(messageContent);

    // Insérer le nouveau message avant le premier enfant du conteneur
    if (container.firstChild) {
      container.insertBefore(messageSample, container.firstChild);
    } else {
      container.appendChild(messageSample);
    }

    setTimeout(() => {
      messageSample.classList.add("show");
    }, 50);
  }

  function formatDate(isoTimestamp) {
    // Crée un objet Date à partir du timestamp ISO 8601
    const date = new Date(isoTimestamp);

    // Options de formatage pour le fuseau horaire Europe/Paris
    const options = {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Paris",
      hour12: false,
    };

    // Utilise Intl.DateTimeFormat pour formater la date selon les options spécifiées
    const formatter = new Intl.DateTimeFormat("en-GB", options);
    const formattedParts = formatter.formatToParts(date);

    // Construction de la chaîne formatée
    const day = formattedParts.find((part) => part.type === "day").value;
    const month = formattedParts.find((part) => part.type === "month").value;
    const hours = formattedParts.find((part) => part.type === "hour").value;
    const minutes = formattedParts.find((part) => part.type === "minute").value;

    const formattedTimestamp = `${day} ${month}, ${hours}:${minutes}`;

    return formattedTimestamp;
  }

  function isMoreThanTenMinutesApart(timestamp1, timestamp2) {
    // Convertir les timestamps en objets Date
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);

    // Calculer la différence en millisecondes
    const diffInMilliseconds = Math.abs(date2 - date1);

    // Convertir la différence en minutes
    const diffInMinutes = diffInMilliseconds / (1000 * 60);

    // Vérifier si la différence dépasse 10 minutes
    return diffInMinutes > 10;
  }

  async function fetchMessages() {
    const response = await axios.get(
      `http://localhost:3000/api/messages/Jess/${await getUsername()}`
    );

    const messages = response.data;
    let isFirstMessage = true;

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      if (isFirstMessage) {
        createDate(formatDate(msg.sendAt));
        isFirstMessage = false; // Met à jour isFirstMessage après avoir ajouté la première date
      }

      if (
        i !== 0 &&
        isMoreThanTenMinutesApart(msg.sendAt, messages[i - 1].sendAt)
      ) {
        createDate(formatDate(msg.sendAt));
      }

      if (msg.from === (await getUsername())) {
        createMessage("right", msg.content, false);
      } else {
        if (i === 0 || messages[i - 1].from !== "Jess") {
          createMessage("left", msg.content, true);
        } else {
          createMessage("left", msg.content, false);
        }
      }
    }
    function processConsecutiveMessages(sender, startIndex, count) {
      let container = document.querySelectorAll(".container .message-sample");
      let l = container.length - 1;

      if (sender == "Jess") {
        if (count == 2) {
          container[l - startIndex].querySelector(
            ".message-content"
          ).style.borderBottomLeftRadius = "0px";
          container[l - startIndex - 1].querySelector(
            ".message-content"
          ).style.borderTopLeftRadius = "0px";
        } else if (count >= 3) {
          container[l - startIndex].querySelector(
            ".message-content"
          ).style.borderBottomLeftRadius = "0px";
          container[l - startIndex - count + 1].querySelector(
            ".message-content"
          ).style.borderTopLeftRadius = "0px";

          for (i = 1; i < count - 1; i++) {
            container[l - startIndex - i].querySelector(
              ".message-content"
            ).style.borderTopLeftRadius = "2px";
            container[l - startIndex - i].querySelector(
              ".message-content"
            ).style.borderBottomLeftRadius = "2px";
          }
        }
      } else {
        if (count == 2) {
          container[l - startIndex].querySelector(
            ".message-content"
          ).style.borderBottomRightRadius = "0px";
          container[l - startIndex - 1].querySelector(
            ".message-content"
          ).style.borderTopRightRadius = "0px";
        } else if (count >= 3) {
          container[l - startIndex].querySelector(
            ".message-content"
          ).style.borderBottomRightRadius = "0px";
          container[l - startIndex - count + 1].querySelector(
            ".message-content"
          ).style.borderTopRightRadius = "0px";

          for (i = 1; i < count - 1; i++) {
            container[l - startIndex - i].querySelector(
              ".message-content"
            ).style.borderTopRightRadius = "2px";
            container[l - startIndex - i].querySelector(
              ".message-content"
            ).style.borderBottomRightRadius = "2px";
          }
        }
      }
    }

    let currentSender = null;
    let consecutiveCount = 0;
    let startIndex = 0;

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      if (msg.from === currentSender) {
        consecutiveCount++;
      } else {
        if (currentSender !== null) {
          processConsecutiveMessages(
            currentSender,
            startIndex,
            consecutiveCount
          );
        }
        currentSender = msg.from;
        consecutiveCount = 1;
        startIndex = i; // Met à jour l'index du premier message consécutif
      }

      // Pour le dernier message
      if (i === messages.length - 1) {
        processConsecutiveMessages(currentSender, startIndex, consecutiveCount);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await fetchMessages();
  });

  document.getElementById("send-button").addEventListener("click", sendMessage);

  // Event listener for Enter key press in message input field
  document
    .getElementById("message-input")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        sendMessage();
      }
    });

  // Function to send message
  async function sendMessage() {
    const messageInput = document.getElementById("message-input");
    const message = messageInput.value.trim(); // Get the trimmed value of the message input

    if (message !== "") {
      // Create message element and add to the right side
      createMessage("right", message, false);

      let container = document.querySelectorAll(".container .message-sample");
      let index = 0;

      while (container[index].classList[1] == "right") {
        index++;
      }
      if (index == 2) {
        container[0].querySelector(
          ".message-content"
        ).style.borderTopRightRadius = "0px";
        container[1].querySelector(
          ".message-content"
        ).style.borderBottomRightRadius = "0px";
      } else if (index >= 3) {
        container[0].querySelector(
          ".message-content"
        ).style.borderTopRightRadius = "0px";
        container[index - 1].querySelector(
          ".message-content"
        ).style.borderBottomRightRadius = "0px";
      }

      for (i = 1; i < index - 1; i++) {
        container[i].querySelector(
          ".message-content"
        ).style.borderTopRightRadius = "2px";
        container[i].querySelector(
          ".message-content"
        ).style.borderBottomRightRadius = "2px";
      }

      // Send message via WebSocket
      const msg = {
        event: "msg",
        from: await getUsername(),
        to: "Jess",
        content: message,
        sendAt: Date.now(),
      };
      ws.send(JSON.stringify(msg));

      // Clear input field after sending message
      messageInput.value = "";
    }
  }
}
