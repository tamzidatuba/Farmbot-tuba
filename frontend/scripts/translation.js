import { translations } from "./i18n.js";

languageSelector = document.getElementById("languageSelector");

export function setLanguage(lang=localStorage.getItem("preferredLanguage") || "en") {
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
  document.documentElement.lang = lang;
  localStorage.setItem("preferredLanguage", lang);
}

languageSelector.addEventListener("change", (event) => {
  setLanguage(event.target.value);
});

export function getTranslation(key) {
  const lang = localStorage.getItem("preferredLanguage") || "en";
  return translations[lang][key] || key;
}

// Load preferred language
window.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("preferredLanguage") || "en";
  document.getElementById("languageSelector").value = savedLang;
  setLanguage(savedLang);
});