window.NAV = {
    lang: "pl",
    siteName: "RWalkuski.github.io",
    ui: {
      brand: "RWalkuski",
      langSwitch: "PL",
      themeLabel: "Motyw:",
      themeSelectAria: "Wybór motywu",
      themeAuto: "Auto",
      themeLight: "Jasny",
      themeDark: "Ciemny",
      menuToggleAria: "Otwórz menu",
      mainNavAria: "Nawigacja",
    },
    top: [
      { label: "Start", href: "./", pageTitle: "Main Page"},

      {
        label: "CAN display",
        href: "candisplay/",
        key: "candisplay",
        pageTitle: "CAN display",
        children: [
                  { label: "Urządzenie", href: "candisplay/",pageTitle:""},
                  { label: "Samochody", href: "candisplay/vehicles/",pageTitle:"Samochody"},
                  //{ label: "Software", href: "candisplay/software/",pageTitle:"Software"},
                ],
      },

    { label: "O mnie", href: "about/",pageTitle:"O mnie"},
    { label: "Kontakt", href: "contact/",pageTitle:"Kontakt"},
  ],
};