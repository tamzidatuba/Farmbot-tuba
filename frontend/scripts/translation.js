import { set } from "mongoose";

languageSelector = document.getElementById("languageSelector");

function setLanguage(lang) {
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  document.documentElement.lang = lang;
  localStorage.setItem("preferredLanguage", lang); // optional: persist choice
}

languageSelector.addEventListener("change", (event) => {
  setLanguage(event.target.value);
});