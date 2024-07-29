async function getIpAddress() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Erreur:", error);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const forgotPassword = document.getElementById("forgot-password-link");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  forgotPassword.addEventListener("click", () => {
    alert(
      "Veuillez me contacter avec votre nom d'utilisateur sur instagram ou snapchat !"
    );
  });

  // Fonction pour vérifier si un ou plusieurs champs sont vides
  function showAlertIfEmpty(fields) {
    for (let field of fields) {
      if (!field.trim()) {
        alert("Veuillez remplir tous les champs.");
        return true; // Si un champ est vide, retourner true
      }
    }
    return false; // Si tous les champs sont remplis, retourner false
  }

  // Écouteur d'événement pour le formulaire de connexion
  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const username = loginForm.querySelector('input[type="username"]').value;
      const password = loginForm.querySelector('input[type="password"]').value;

      if (showAlertIfEmpty([username, password])) {
        return; // Arrêter l'exécution si un champ est vide
      }

      try {
        const response = await axios.post("http://localhost:3000/api/login", {
          username: username,
          password: password,
        });

        if (response.data.code === 404) {
          alert("Pas de compte avec ce nom d'utilisateur.");
        } else if (response.data.code === 403) {
          alert("Nom d'utilisateur ou mot de passe incorrect.");
        } else if (response.data && response.data.token) {
          localStorage.setItem("token", response.data.token);
          window.location.href = "/chat";
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 403) {
            alert("Nom d'utilisateur ou mot de passe incorrect.");
          } else {
            alert(
              `Erreur ${error.response.status}: ${error.response.statusText}`
            );
          }
        } else {
          alert("Erreur : Impossible de joindre le serveur.");
        }
      }
    });
  }

  // Écouteur d'événement pour le formulaire d'inscription
  if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const username = registerForm.querySelector(
        'input[type="username"]'
      ).value;
      const password = registerForm.querySelector(
        'input[type="password"]'
      ).value;

      if (showAlertIfEmpty([username, password])) {
        return; // Arrêter l'exécution si un champ est vide
      }

      try {
        const response = await axios.post(
          "http://localhost:3000/api/register",
          {
            username: username,
            password: password,
            ip: await getIpAddress(),
          }
        );

        if (response.data.code === 404) {
          alert("Nom d'utilisateur déjà pris ou autres erreurs.");
        } else if (response.data.code === 403) {
          alert("Erreur d'inscription.");
        } else if (response.data && response.data.token) {
          localStorage.setItem("token", response.data.token);
          window.location.href = "/chat";
        }
      } catch (error) {
        if (error.response) {
          alert(
            `Erreur ${error.response.status}: ${error.response.statusText}`
          );
        } else {
          alert("Erreur : Impossible de joindre le serveur.");
        }
      }
    });
  }
});

const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});
