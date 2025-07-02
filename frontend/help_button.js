document.getElementById("help-button").addEventListener("click", function () {
    const helpTexts = document.querySelectorAll(".help-text");
    const translucent = document.getElementById("helpTranslucent");
  

    const isVisible = helpTexts[0].style.display === "block";

    helpTexts.forEach(function (text) {
      text.style.display = isVisible ? "none" : "block";
    });

    translucent.style.display = isVisible ? "none" : "block";
  });

  // to close help
  document.getElementById("helpTranslucent").addEventListener("click", function () {
    document.querySelectorAll(".help-text").forEach(text => text.style.display = "none");
    this.style.display = "none";
  });

document.getElementById("help-button").addEventListener("click", function () {
    const helpTexts = document.querySelectorAll(".help-text-grid");
    const translucent = document.getElementById("helpTranslucent");
  

    const isVisible = helpTexts[0].style.display === "block";

    helpTexts.forEach(function (text) {
      text.style.display = isVisible ? "none" : "block";
    });

    translucent.style.display = isVisible ? "none" : "block";
  });

  // to close help
  document.getElementById("helpTranslucent").addEventListener("click", function () {
    document.querySelectorAll(".help-text-grid").forEach(text => text.style.display = "none");
    this.style.display = "none";
  });


  document.getElementById("help-button").addEventListener("click", function () {
    const helpTexts = document.querySelectorAll(".help-text-status");
    const translucent = document.getElementById("helpTranslucent");
  

    const isVisible = helpTexts[0].style.display === "block";

    helpTexts.forEach(function (text) {
      text.style.display = isVisible ? "none" : "block";
    });

    translucent.style.display = isVisible ? "none" : "block";
  });

  // to close help
  document.getElementById("helpTranslucent").addEventListener("click", function () {
    document.querySelectorAll(".help-text-status").forEach(text => text.style.display = "none");
    this.style.display = "none";
  });



document.getElementById("help-button").addEventListener("click", function () {
    const helpTexts = document.querySelectorAll(".help-text-history");
    const translucent = document.getElementById("helpTranslucent");
  

    const isVisible = helpTexts[0].style.display === "block";

    helpTexts.forEach(function (text) {
      text.style.display = isVisible ? "none" : "block";
    });

    translucent.style.display = isVisible ? "none" : "block";
  });

  // to close help
  document.getElementById("helpTranslucent").addEventListener("click", function () {
    document.querySelectorAll(".help-text-history").forEach(text => text.style.display = "none");
    this.style.display = "none";
  });