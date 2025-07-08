document.getElementById("help-button").addEventListener("click", function () {
  const helpTexts = document.querySelectorAll('[class^="help-text-"]');
  const translucent = document.getElementById("helpTranslucent");

  const isVisible = Array.from(helpTexts).some(el => el.style.display === "block");

  helpTexts.forEach(text => {
    text.style.display = isVisible ? "none" : "block";
  });

  translucent.style.display = isVisible ? "none" : "block";
});

document.getElementById("helpTranslucent").addEventListener("click", function () {
  document.querySelectorAll('[class^="help-text-"]').forEach(text => {
    text.style.display = "none";
  });
  this.style.display = "none";
});
