async function injectTemplates() {
  const res = await fetch("/assets/html/layout.html");
  const html = await res.text();

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;

  const headerTpl = wrapper.querySelector("#site-header");
  const footerTpl = wrapper.querySelector("#site-footer");

  const headerSlot = document.querySelector("#header-slot");
  const footerSlot = document.querySelector("#footer-slot");

  headerSlot.replaceChildren();
  footerSlot.replaceChildren();

  headerSlot.appendChild(headerTpl.content.cloneNode(true));
  footerSlot.appendChild(footerTpl.content.cloneNode(true));
}

function bindHamburger() {
  const btn = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  if (!btn || !nav) return;

  const setExpanded = (open) =>
    btn.setAttribute("aria-expanded", open ? "true" : "false");

  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    setExpanded(open);
  });

  document.addEventListener("click", (e) => {
    const inside = nav.contains(e.target) || btn.contains(e.target);
    if (!inside && nav.classList.contains("open")) {
      nav.classList.remove("open");
      setExpanded(false);
    }
  });
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "light" || theme === "dark") root.dataset.theme = theme;
  else delete root.dataset.theme;
}

function setupThemeSelect() {
  const select = document.querySelector(".theme-select");
  if (!select) return;

  const saved = localStorage.getItem("theme");
  const initial = saved ?? "auto";

  select.value = initial;
  applyTheme(initial);

  select.addEventListener("change", () => {
    const v = select.value;
    applyTheme(v);
    if (v === "auto") localStorage.removeItem("theme");
    else localStorage.setItem("theme", v);
  });
}

function normalizePathname(p) {
  return (p || "/").replace(/\/+$/, "/");
}

function currentPath() {
  return normalizePathname(new URL(window.location.href).pathname);
}

function hrefToPathname(href) {
  const url = new URL(href, document.baseURI);
  return normalizePathname(url.pathname);
}

function clearAriaCurrent(scope) {
  scope.querySelectorAll('a[aria-current="page"]').forEach(a => a.removeAttribute("aria-current"));
}

function markCurrentInScope(scope) {
  const cp = currentPath();
  const links = scope.querySelectorAll("a[href]");
  for (const a of links) {
    if (hrefToPathname(a.getAttribute("href")) === cp) {
      a.setAttribute("aria-current", "page");
      return a;
    }
  }
  return null;
}

function buildHeaderNavFromManifest() {
  const nav = document.querySelector("#site-nav");
  if (!nav) return;
  nav.replaceChildren();

  const cfg = window.NAV;
  if (!cfg || !Array.isArray(cfg.top)) return;

  cfg.top.forEach(item => {
    if (!item.children) {
      const a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;
      nav.appendChild(a);
      return;
    }

    const dd = document.createElement("div");
    dd.className = "nav-item split has-submenu";
    dd.setAttribute("data-dropdown", "");

    const main = document.createElement("a");
    main.className = "split-main";
    main.href = item.href;
    main.textContent = item.label;

    const btn = document.createElement("button");
    btn.className = "split-toggle";
    btn.type = "button";
    btn.setAttribute("data-dropdown-btn", "");
    btn.setAttribute("aria-label", `Rozwiń ${item.label}`);
    btn.setAttribute("aria-expanded", "false");

    const submenuId = `submenu-${item.key || item.label.toLowerCase().replace(/\s+/g, "-")}`;
    btn.setAttribute("aria-controls", submenuId);

    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "▾";
    btn.appendChild(arrow);

    const menu = document.createElement("div");
    menu.id = submenuId;
    menu.className = "submenu";
    menu.setAttribute("data-dropdown-menu", "");
    menu.setAttribute("aria-label", item.label);

    item.children.forEach(ch => {
      const a = document.createElement("a");
      a.href = ch.href;
      a.textContent = ch.label;
      menu.appendChild(a);
    });

    dd.appendChild(main);
    dd.appendChild(btn);
    dd.appendChild(menu);
    nav.appendChild(dd);
  });
}

function setupDropdowns() {
  const dropdowns = document.querySelectorAll("[data-dropdown]");

  const close = (dd) => {
    dd.classList.remove("open");
    const btn = dd.querySelector("[data-dropdown-btn]");
    if (btn) btn.setAttribute("aria-expanded", "false");
  };

  const open = (dd) => {
    dd.classList.add("open");
    const btn = dd.querySelector("[data-dropdown-btn]");
    if (btn) btn.setAttribute("aria-expanded", "true");
  };

  const closeAll = (except = null) => {
    dropdowns.forEach(dd => { if (dd !== except) close(dd); });
  };

  dropdowns.forEach(dd => {
    const btn = dd.querySelector("[data-dropdown-btn]");
    const menu = dd.querySelector("[data-dropdown-menu]");
    if (!btn || !menu) return;

    const id = btn.getAttribute("aria-controls");
    if (!id) return;
    if (menu.id !== id) menu.id = id;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = dd.classList.contains("open");
      closeAll(dd);
      isOpen ? close(dd) : open(dd);
    });

    dd.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close(dd);
    });
  });

  document.addEventListener("click", () => closeAll());
}

function findSectionKeyFromPath() {
  const cp = currentPath();
  const parts = cp.split("/").filter(Boolean);

  if (parts[0] === "pl") return parts[1] || null;
  return parts[0] || null;
}

function buildTabsForCurrentSection() {
  const slot = document.querySelector("#section-tabs-slot");
  if (!slot) return;

  slot.replaceChildren();

  const key = findSectionKeyFromPath();
  const cfg = window.NAV;
  const section = cfg?.top?.find(x => x.key === key && Array.isArray(x.children));
  if (!section) return;

  const nav = document.createElement("nav");
  nav.className = "section-tabs";
  nav.setAttribute("aria-label", section.label);

  section.children.forEach(ch => {
    const a = document.createElement("a");
    a.href = ch.href;
    a.textContent = ch.label;
    nav.appendChild(a);
  });

  slot.appendChild(nav);
}

function syncAriaCurrentEverywhere() {
  const headerNav = document.querySelector("#site-nav");
  if (headerNav) {
    clearAriaCurrent(headerNav);
    markCurrentInScope(headerNav);
  }

  const tabs = document.querySelector(".section-tabs");
  if (tabs) {
    clearAriaCurrent(tabs);
    markCurrentInScope(tabs);
  }
}

function openDropdownIfCurrentInside() {
  document.querySelectorAll("[data-dropdown]").forEach(dd => {
    const btn  = dd.querySelector("[data-dropdown-btn]");
    const menu = dd.querySelector("[data-dropdown-menu]");
    if (!btn || !menu) return;

    const hasCurrent = !!menu.querySelector('a[aria-current="page"]');
    dd.classList.toggle("open", hasCurrent);
    btn.setAttribute("aria-expanded", hasCurrent ? "true" : "false"); // [web:415]
  });
}

function enforceMobileDropdownOff() {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (!isMobile) return;

  document.querySelectorAll("[data-dropdown]").forEach(dd => {
    dd.classList.remove("open");
    const btn = dd.querySelector("[data-dropdown-btn]");
    if (btn) btn.setAttribute("aria-expanded", "false");
  });
}

function highlightActiveSectionInTopNav() {
  const nav = document.querySelector("#site-nav");
  if (!nav) return;

  nav.querySelectorAll("[data-active-section]").forEach(a => a.removeAttribute("data-active-section"));

  const key = findSectionKeyFromPath();
  if (!key) return;

  const section = window.NAV?.top?.find(x => x.key === key);
  if (!section) return;

  const links = nav.querySelectorAll('a[href]');
  for (const a of links) {
    if (hrefToPathname(a.getAttribute("href")) === hrefToPathname(section.href)) {
      a.setAttribute("data-active-section", "true");
      break;
    }
  }
}

function setPageTitleFromManifest() {
  const cfg = window.NAV;
  if (!cfg) return;

  const cp = currentPath();

  let match = null;
  let section = null;

  for (const top of (cfg.top || [])) {
    if (hrefToPathname(top.href) === cp) { match = top; break; }
    for (const ch of (top.children || [])) {
      if (hrefToPathname(ch.href) === cp) { match = ch; section = top; break; }
    }
    if (match) break;
  }

  if (!match) return;

  const site = cfg.siteName || "";
  const page = match.pageTitle || match.label || "";
  const sec  = section ? (section.page || section.label || "") : "";

  const parts = [page];
  if (sec && sec !== page) parts.push(sec);
  if (site) parts.push(site);

  document.title = parts.join(" - ");
}

function otherLangUrl() {
  const p = window.location.pathname;
  if (p.startsWith("/pl/")) return p.replace(/^\/pl\//, "/");
  return "/pl" + (p.startsWith("/") ? p : "/" + p);
}

function applyLang() {
  const lang = window.NAV?.lang;
  if (lang) document.documentElement.lang = lang;
}

function setupLangSwitch() {
  const a = document.querySelector(".lang-switch");
  if (!a) return;

  const isPl = window.location.pathname.startsWith("/pl/");
  a.textContent = isPl ? "EN" : "PL";
  a.href = otherLangUrl();
}

function applyUiTranslations() {
  const ui = window.NAV?.ui;
  if (!ui) return;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (key && ui[key] != null) el.textContent = ui[key];
  });

  document.querySelectorAll("[data-i18n-attr]").forEach(el => {
    const spec = el.getAttribute("data-i18n-attr") || "";
    const parts = spec.split(",").map(s => s.trim()).filter(Boolean);

    parts.forEach(p => {
      const [attr, key] = p.split(":").map(s => s.trim());
      if (!attr || !key) return;
      if (ui[key] != null) el.setAttribute(attr, ui[key]);
    });
  });

  if (window.NAV?.lang) document.documentElement.lang = window.NAV.lang;
}

function setupGalleryLightbox() {
  const dlg = document.querySelector("#lightbox");
  if (!dlg) return;

  const closeBtn = dlg.querySelector(".lightbox-close");
  const img = dlg.querySelector(".lightbox-img");
  const vid = dlg.querySelector(".lightbox-vid");
  const cap = dlg.querySelector(".lightbox-cap");

  const thumbs = Array.from(document.querySelectorAll(".gallery-thumb"));
  if (!thumbs.length) return;

  let currentIndex = -1;

  const stopVideo = () => {
    if (!vid) return;
    vid.src = "";
    vid.title = "";
    vid.style.display = "none";
  };

  const showImage = (src, caption) => {
    stopVideo();
    if (img) {
      img.style.display = "block";
      img.src = src || "";
      img.alt = caption || "";
    }
  };

  const showVideo = (embedUrl, caption) => {
    if (img) {
      img.style.display = "none";
      img.src = "";
      img.alt = "";
    }
    if (vid) {
      vid.style.display = "block";
      vid.title = caption || "";
      const sep = embedUrl.includes("?") ? "&" : "?";
      vid.src = embedUrl + sep + "autoplay=1";
    }
  };

  const getCaption = (btn) =>
    btn.getAttribute("data-caption") ||
    btn.getAttribute("data-alt") ||
    btn.querySelector("img")?.alt ||
    "";

  const showAt = (idx) => {
    if (idx < 0) idx = thumbs.length - 1;
    if (idx >= thumbs.length) idx = 0;

    const btn = thumbs[idx];
    const full = btn.getAttribute("data-full");
    const video = btn.getAttribute("data-video");
    const caption = getCaption(btn);

    currentIndex = idx;
    if (cap) cap.textContent = caption;

    if (video) showVideo(video, caption);
    else showImage(full, caption);

    dlg.focus({ preventScroll: true });
  };

  thumbs.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      showAt(idx);
      dlg.showModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      dlg.close();
    });
  }

  dlg.addEventListener("cancel", (e) => {
    e.preventDefault();
    dlg.close();
  });

  dlg.addEventListener("keydown", (e) => {
    if (!dlg.open) return;
    if (e.key === "ArrowRight") { e.preventDefault(); showAt(currentIndex + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); showAt(currentIndex - 1); }
  });

  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close();
  });

  dlg.addEventListener("pointerdown", (e) => {
    if (!dlg.open) return;
    if (vid && e.target === vid) setTimeout(() => dlg.focus({ preventScroll: true }), 0);
  }, true);

  dlg.addEventListener("close", () => {
    stopVideo();
    if (img) { img.src = ""; img.alt = ""; img.style.display = "none"; }
    if (cap) cap.textContent = "";
    currentIndex = -1;
  });
}


function setupVehicleDetailsSearch() {
  const input = document.querySelector("#veh-q");
  if (!input) return;

  const section = input.closest(".veh-list");
  if (!section) return;

  const items = Array.from(section.querySelectorAll("details.veh-item"));
  const run = () => {
    const q = (input.value || "").trim().toLowerCase();

    for (const d of items) {
      const head = d.querySelector(".veh-head")?.textContent || "";
      const hay = (head).toLowerCase();

      const ok = !q || hay.includes(q);
      d.hidden = !ok;
      if (!ok) d.open = false;
    }
  };

  input.addEventListener("input", run);
  run();
}

function currentLangPrefix() {
  return window.location.pathname.startsWith("/pl/") ? "pl" : "en";
}

async function loadVehicleFragments() {
  const host = document.querySelector("#veh-items");
  if (!host) return;

  const lang = currentLangPrefix();
  const index = await (await fetch("/assets/vehicles/index.json")).json();

  host.replaceChildren();

  for (const it of index) {
    const url = `/assets/vehicles/${lang}/${it.slug}.html`;
    const res = await fetch(url);
    if (!res.ok) continue;
    host.insertAdjacentHTML("beforeend", await res.text());
  }
}


function setupVehicleTabsAutoIds() {
  const groups = document.querySelectorAll("[data-tabs]");
  groups.forEach((tabs, gi) => {
    const inputs = Array.from(tabs.querySelectorAll("[data-tab-input]"));
    const labels = Array.from(tabs.querySelectorAll("[data-tab-label]"));
    const panels = Array.from(tabs.querySelectorAll("[data-tab-panel]"));

    if (inputs.length !== labels.length || inputs.length !== panels.length) return;

    const groupName = `veh-tabs-${gi}`;
    inputs.forEach((inp, i) => {
      const id = `${groupName}-tab-${i}`;
      inp.name = groupName;
      inp.id = id;
      labels[i].setAttribute("for", id);
    });

    const apply = () => {
      const idx = inputs.findIndex(x => x.checked);
      labels.forEach((l, i) => l.classList.toggle("is-active", i === idx));
      panels.forEach((p, i) => p.classList.toggle("is-active", i === idx));
    };

    inputs.forEach(inp => inp.addEventListener("change", apply));
    apply();
  });
}

function setupContactFormAjax() {
  const form = document.querySelector(".contact-form");
  const status = document.querySelector("#contact-status");
  if (!form || !status) return;

  const isPl = window.location.pathname.startsWith("/pl/");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    status.classList.remove("ok", "err");
    status.classList.add("is-show");
    status.textContent = isPl ? "Wysyłanie…" : "Sending…";

    try {
      const res = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      });

      if (res.ok) {
        form.reset();
        status.classList.remove("err");
        status.classList.add("ok");
        status.textContent = isPl ? "Wiadomość wysłana. Dzięki!" : "Message sent. Thanks!";
      } else {
        status.classList.remove("ok");
        status.classList.add("err");
        status.textContent = isPl
          ? "Błąd wysyłki. Spróbuj ponownie później."
          : "Submit failed. Please try again later.";
      }
    } catch {
      status.classList.remove("ok");
      status.classList.add("err");
      status.textContent = isPl ? "Błąd sieci / brak połączenia." : "Network error.";
    }
  });
}



window.addEventListener("DOMContentLoaded", async () => {
  await injectTemplates();

  applyUiTranslations();
  buildHeaderNavFromManifest();

  bindHamburger();
  setupThemeSelect();
  setupDropdowns();
  buildTabsForCurrentSection();

  await loadVehicleFragments();
  setupVehicleTabsAutoIds();
  setupVehicleDetailsSearch();

  setupGalleryLightbox();

  syncAriaCurrentEverywhere();
  highlightActiveSectionInTopNav();
  enforceMobileDropdownOff();
  window.addEventListener("resize", enforceMobileDropdownOff);
  setPageTitleFromManifest();
  applyLang();
  setupLangSwitch();
  setupContactFormAjax();
});



