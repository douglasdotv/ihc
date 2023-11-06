/*!
 * Start Bootstrap - Grayscale v7.0.6 (https://startbootstrap.com/theme/grayscale)
 * Copyright 2013-2023 Start Bootstrap
 * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-grayscale/blob/master/LICENSE)
 */
//
// Scripts
//

let activeLanguage = "pt-BR";
let translationsMap = {};
let currentChart;
let currentChartDivId;

window.addEventListener("DOMContentLoaded", (event) => {
  const navbarShrink = function () {
    const navbarCollapsible = document.body.querySelector("#mainNav");
    if (!navbarCollapsible) {
      return;
    }
    if (window.scrollY === 0) {
      navbarCollapsible.classList.remove("navbar-shrink");
    } else {
      navbarCollapsible.classList.add("navbar-shrink");
    }
  };

  navbarShrink();

  document.addEventListener("scroll", navbarShrink);

  const mainNav = document.body.querySelector("#mainNav");
  if (mainNav) {
    new bootstrap.ScrollSpy(document.body, {
      target: "#mainNav",
      rootMargin: "0px 0px -40%",
    });
  }

  const navbarToggler = document.body.querySelector(".navbar-toggler");

  const responsiveNavItems = [].slice.call(
    document.querySelectorAll("#navbarResponsive .nav-link")
  );

  responsiveNavItems.map(function (responsiveNavItem) {
    responsiveNavItem.addEventListener("click", () => {
      if (window.getComputedStyle(navbarToggler).display !== "none") {
        navbarToggler.click();
      }
    });
  });

  const forms = document.querySelectorAll(".needs-validation");
  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      "input",
      function (event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });

  document.querySelectorAll(".nav-link").forEach((tab) => {
    tab.addEventListener("shown.bs.tab", (event) => {
      const targetId = event.target.getAttribute("href").substring(1);
      document.querySelectorAll(".tab-pane").forEach((tabPane) => {
        if (tabPane.id !== targetId) {
          tabPane.innerHTML = "";
        }
      });
      switch (targetId) {
        case "deforestationRainfallCorrelChartTotal":
          fetchAndCreatePlotlyChart(
            "gfc_correlacao_geral.json",
            "deforestationRainfallCorrelChartTotal"
          );
          break;
        case "yearlyDeforestationChart":
          fetchAndCreatePlotlyChart(
            "gfc_desmatamento_totais.json",
            "yearlyDeforestationChart"
          );
          break;
        case "deforestationByStateChart":
          fetchAndCreatePlotlyChart(
            "gfc_desmatamento_valores_totais.json",
            "deforestationByStateChart"
          );
          break;
        case "yearlyAvgRainfallChartState":
          fetchAndCreatePlotlyChart(
            "gfc_med_chuvas_ano.json",
            "yearlyAvgRainfallChartState"
          );
          break;
        case "yearlyAmountOfRainfallChartTotal":
          fetchAndCreatePlotlyChart(
            "gfc_precipitacao_total_ano.json",
            "yearlyAmountOfRainfallChartTotal"
          );
          break;
        case "deforestationRainfallCorrelChartByState":
          let dropdown = document.querySelector("#dropdownSelector");
          if (!dropdown) {
            const tabPane = document.getElementById(
              "deforestationRainfallCorrelChartByState"
            );
            const selectStateString =
              activeLanguage === "pt-BR"
                ? "Selecione um estado: "
                : "Select a state: ";
            tabPane.innerHTML = `
            <label for="dropdownSelector" class="translatable" data-key="dropdownSelectorLabelTxt">${selectStateString}</label>
            <select id="dropdownSelector" class="form-select mt-2">
              <option value="acre" selected>Acre</option>
              <option value="amapa">Amapá</option>
              <option value="amazonas">Amazonas</option>
              <option value="maranhao">Maranhão</option>
              <option value="matogrosso">Mato Grosso</option>
              <option value="para">Pará</option>
              <option value="rondonia">Rondônia</option>
              <option value="roraima">Roraima</option>
              <option value="tocantins">Tocantins</option>
            </select>
            <div id="deforestationRainfallCorrelChartByStateContent"></div>
            `;
            dropdown = document.querySelector("#dropdownSelector");
            dropdown.addEventListener("change", () => {
              const dropdownValue = dropdown.value;
              fetchAndCreateDropdownChart(dropdownValue);
            });
          }
          const defaultDropdownValue = dropdown.value;
          fetchAndCreateDropdownChart(defaultDropdownValue);
          break;
        default:
          break;
      }
    });
  });

  document.querySelector("#dropdownSelector").addEventListener("change", () => {
    const dropdownValue = document.querySelector("#dropdownSelector").value;
    fetchAndCreateDropdownChart(dropdownValue);
  });

  document.querySelectorAll(".lang-button").forEach((button) => {
    button.addEventListener("click", function () {
      const lang = this.getAttribute("data-lang");
      activeLanguage = lang;
      loadTranslations(activeLanguage);
    });
  });

  preloadTranslations(["en", "pt-BR", "kr"]);
  fetchAndCreatePlotlyChart(
    "gfc_correlacao_geral.json",
    "deforestationRainfallCorrelChartTotal"
  );
});

function fetchAndCreatePlotlyChart(jsonFileName, divId) {
  currentChart = jsonFileName;
  currentChartDivId = divId;

  fetch(`data/charts/${jsonFileName}`)
    .then((response) => response.json())
    .then((pyJson) => {
      const jsData = pyJson.data;
      const jsLayout = pyJson.layout;

      const translations = translationsMap[activeLanguage];
      const baseFileName = jsonFileName.replace(".json", "");

      jsLayout.title.text = translations[`${baseFileName}_title`];
      jsLayout.xaxis.title.text = translations[`${baseFileName}_xaxis`];
      jsLayout.yaxis.title.text = translations[`${baseFileName}_yaxis`];
      if (activeLanguage !== "pt-BR") jsLayout.showlegend = false;

      Plotly.newPlot(divId, jsData, jsLayout, { responsive: true });
    })
    .catch((e) => {
      console.error("Error: ", e);
      document.getElementById(divId).innerHTML = "Oops!";
    });
}

const fetchAndCreateDropdownChart = (option) => {
  fetch(`data/charts/${option}.json`)
    .then((response) => {
      return response.json();
    })
    .then((pyJson) => {
      const jsData = pyJson.data;
      const jsLayout = pyJson.layout;

      jsLayout.title = option.charAt(0).toUpperCase() + option.slice(1);
      jsLayout.xaxis.title = "";
      jsLayout.yaxis.title = "";
      if (activeLanguage !== "pt-BR") jsLayout.showlegend = false;

      Plotly.newPlot(
        "deforestationRainfallCorrelChartByStateContent",
        jsData,
        jsLayout,
        { responsive: true }
      );
    })
    .catch((e) => {
      console.error("Error: ", e);
      document.getElementById(
        "deforestationRainfallCorrelChartByStateContent"
      ).innerHTML = "Oops!";
    });
};

const preloadTranslations = (languages) => {
  languages.forEach((lang) => {
    fetch(`data/translations/${lang}.json`)
      .then((response) => response.json())
      .then((data) => {
        translationsMap[lang] = data;
      });
  });
};

const loadTranslations = (lang) => {
  activeLanguage = lang;
  const translations = translationsMap[activeLanguage];
  if (translations) {
    applyTranslations(translations);
  } else {
    console.error(`Translations for ${lang} not found.`);
  }
};

const applyTranslations = (translations) => {
  document.querySelectorAll(".translatable").forEach((element) => {
    const key = element.getAttribute("data-key");
    if (translations[key]) {
      element.innerText = translations[key];
    }

    const placeholderKey = element.getAttribute("data-placeholder-key");
    if (placeholderKey && translations[placeholderKey]) {
      element.setAttribute("placeholder", translations[placeholderKey]);
    }
  });
  selectFirstChart();
};

const selectFirstChart = () => {
  document.querySelectorAll(".nav-link.active").forEach((activeTab) => {
    activeTab.classList.remove("active");
  });
  document
    .querySelector("#deforestation-rainfall-correl-chart-total-tab")
    .click();
};
