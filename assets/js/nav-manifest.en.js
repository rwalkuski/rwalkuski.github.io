window.NAV = {
    lang: "en",
    siteName: "RWalkuski.github.io",
    ui: {
      brand: "RWalkuski",
      langSwitch: "EN",
      themeLabel: "Theme:",
      themeSelectAria: "Theme selection",
      themeAuto: "Auto",
      themeLight: "Light",
      themeDark: "Dark",
      menuToggleAria: "Open menu",
      mainNavAria: "Main navigation",
    },
    top: [
      { label: "Start", href: "./", pageTitle: "Main Page"},

      {
        label: "CAN display",
        href: "candisplay/",
        key: "candisplay",
        pageTitle: "CAN display",
        children: [
                  { label: "About", href: "candisplay/",pageTitle:"About"},
                  { label: "Vehicles", href: "candisplay/vehicles/",pageTitle:"Vehicles"},
                  //{ label: "Software", href: "candisplay/software/",pageTitle:"Firmware"},
                ],
      },

    { label: "About", href: "about/",pageTitle:"About"},
    { label: "Contact", href: "contact/",pageTitle:"Contact"},
  ],
};
