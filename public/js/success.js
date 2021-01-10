document.addEventListener("DOMContentLoaded", () => {
  const yourUrlField = document.querySelector("#your-url"),
    copyUrlBtn = document.querySelector("#copy-url"),
    openUrlBtn = document.querySelector("#open-url");

  copyUrlBtn.addEventListener("click", () => {
    yourUrlField.disabled = false;
    yourUrlField.select();
    document.execCommand("copy");
    yourUrlField.disabled = true;
    $("#copy-success").fadeIn("slow");
    setTimeout(() => {
      $("#copy-success").fadeOut("slow");
    }, 2000);
  });

  openUrlBtn.addEventListener("click", () => {
    const redirectUrl = yourUrlField.value.trim();
    window.open(redirectUrl);
  });
});
