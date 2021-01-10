document.addEventListener("DOMContentLoaded", () => {
  // show the file name
  const fileInput = document.querySelector("#file-field input[type=file]");
  if (fileInput) {
    fileInput.onchange = () => {
      if (fileInput.files.length > 0) {
        const fileName = document.querySelector("#file-field .file-name");
        fileName.textContent = fileInput.files[0].name;
      }
    };
  }

  // attach click eventlisteners to submit buttons
  document.querySelectorAll("#submit-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("is-loading");
    });
  });

  // toggle navbar on small screens
  const navBurgerIcon = document.querySelector(".navbar-burger");
  if (navBurgerIcon) {
    navBurgerIcon.addEventListener("click", () => {
      document.querySelector(".navbar-burger").classList.toggle("is-active");
      document.querySelector(".navbar-menu").classList.toggle("is-active");
    });
  }

  // remove flash messages section
  const flashMessages = $("section#flash_messages");
  if (flashMessages) {
    setTimeout(() => {
      flashMessages.fadeOut("slow");
    }, 3500);
  }
});
