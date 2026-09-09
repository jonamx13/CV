/* ==========================================================================
   MAIN.JS
   1. Loads each HTML component into its placeholder (works on GitHub Pages
      since it's served over HTTPS - no bundler/build step required).
   2. Applies the EN/ES dictionary from translations.js to every element
      carrying a data-i18n attribute.
   3. Wires up the language switch and the "Download PDF" button.
   ========================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "cv-lang";

  /* --- 1. Component loading -------------------------------------------- */
  function loadComponents() {
    var placeholders = Array.prototype.slice.call(document.querySelectorAll("[data-include]"));
    return Promise.all(placeholders.map(function (el) {
      var path = el.getAttribute("data-include");
      return fetch(path, { cache: "no-cache" })
        .then(function (res) {
          if (!res.ok) throw new Error("Failed to load " + path + " (" + res.status + ")");
          return res.text();
        })
        .then(function (html) {
          var tpl = document.createElement("template");
          tpl.innerHTML = html;
          el.replaceWith(tpl.content);
        })
        .catch(function (err) {
          console.error(err);
          el.innerHTML = "<p style=\"padding:1rem;color:#f88;\">Couldn't load this section (" + path + ").</p>";
        });
    }));
  }

  /* --- 2. Translation engine --------------------------------------------- */
  function applyLanguage(lang) {
    var dict = window.TRANSLATIONS && window.TRANSLATIONS[lang];
    if (!dict) return;

    document.documentElement.setAttribute("lang", lang);
    if (dict["meta.title"]) document.title = dict["meta.title"];

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    var enLabel = document.getElementById("lang-label-en");
    var esLabel = document.getElementById("lang-label-es");
    if (enLabel && esLabel) {
      enLabel.classList.toggle("is-active", lang === "en");
      esLabel.classList.toggle("is-active", lang === "es");
    }

    var switchInput = document.getElementById("lang-switch");
    if (switchInput) {
      switchInput.checked = lang === "es";
      switchInput.setAttribute("aria-checked", String(lang === "es"));
    }

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage unavailable, ignore */ }
  }

  function getPreferredLanguage() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    if (saved === "en" || saved === "es") return saved;
    return "en";
  }

  function initLanguageToggle() {
    var switchInput = document.getElementById("lang-switch");
    if (!switchInput) return;
    switchInput.addEventListener("change", function () {
      applyLanguage(switchInput.checked ? "es" : "en");
    });
  }

   /* --- 3. Download / print button ---------------------------------------- */
  /* function initDownloadButton() {
    var btn = document.getElementById("download-pdf-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      window.print();
    });
  } */

  /* --- Boot ---------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    loadComponents().then(function () {
      initLanguageToggle();
      // initDownloadButton();
      applyLanguage(getPreferredLanguage());
    });
  });
})();