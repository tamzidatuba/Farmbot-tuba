import { translations } from "./i18n.js";
//import { translateHistory } from "./notification_status.js";

const languageSelector = document.getElementById("languageSelector");


function setLanguage(lang=localStorage.getItem("preferredLanguage") || "en") {
  const elements = document.querySelectorAll("[data-i18n], [data-i18n-title], [data-i18n-placeholder]");
  elements.forEach(el => {
    if (el.dataset.i18n) {
      const key = el.getAttribute("data-i18n");
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    }
    
    if (el.dataset.i18nTitle) {
      const key = el.dataset.i18nTitle;
      if (translations[lang] && translations[lang][key]) {
        el.title = translations[lang][key];
      }
    }
    if (el.dataset.i18nPlaceholder) {
      const key = el.getAttribute("data-i18n-placeholder");
      if (translations[lang] && translations[lang][key]) {
        el.placeholder = translations[lang][key];
      }
    }
  });
  //translateHistory(); // Update history translations
  document.documentElement.lang = lang;
  localStorage.setItem("preferredLanguage", lang);
}

languageSelector.addEventListener("change", (event) => {
  setLanguage(event.target.value);
});

function getTranslation(key) {
  const lang = localStorage.getItem("preferredLanguage") || "en";
  return translations[lang][key] || key;
}

function createLanguageButtons() {
  languageSelector.innerHTML = ""; // Clear existing buttons if any

  const currentLang = localStorage.getItem("preferredLanguage") || "en";

  for (const langCode in translations) {
    const langName = translations[langCode]._name;
    const option = document.createElement("option");

    option.value = langCode;
    option.textContent = langName;

    if (langCode === currentLang) {
      option.selected = true; // Set the current language as selected
    }

    languageSelector.appendChild(option);
  }
}

// Load preferred language
window.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("preferredLanguage") || "en";
  languageSelector.value = savedLang;
  setLanguage(savedLang);
  createLanguageButtons();
});

export {
  getTranslation,
  setLanguage,
  languageSelector
};