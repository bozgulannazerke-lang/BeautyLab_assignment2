/* =====================================================================
   Beauty Lab - main script (shared by every page)
   Sections:
   1. Storage helpers        6. Auth (sign up page, log-in pop-up, profile)
   2. Theme (light / dark)   7. Price finder (search + filter)
   3. Navbar enhancements    8. Weather API (Open-Meteo)
   4. Sounds & small UI      9. Booking form (contact page) + history
   5. Form validation
   ===================================================================== */
"use strict";

/* ---------- 1. Storage helpers ---------- */
const KEYS = {
  theme: "beautylab_theme",
  users: "beautylab_users",
  session: "beautylab_session",
  filter: "beautylab_filter",
  bookings: "beautylab_bookings"
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* storage blocked */ }
}

/* ---------- 2. Theme (light / dark) ---------- */
function getTheme() {
  return localStorage.getItem(KEYS.theme) === "dark" ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-bs-theme", theme);
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.innerHTML = theme === "dark"
      ? '<span class="theme-icon">☀️</span> Light'
      : '<span class="theme-icon">🌙</span> Dark';
    toggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }
}

/* ---------- Auth data helpers (used by navbar too) ---------- */
function getUsers() { return readJSON(KEYS.users, []); }

function getCurrentUser() {
  const email = localStorage.getItem(KEYS.session);
  if (!email) return null;
  return getUsers().find(user => user.email === email) || null;
}

/* ---------- 3. Navbar enhancements ---------- */
function setupNavbar() {
  const navList = document.querySelector(".navbar-nav");
  if (!navList) return;
  const user = getCurrentUser();

  // Profile is always in the menu (guests are sent to the login page)
  const profileItem = document.createElement("li");
  profileItem.className = "nav-item";
  profileItem.innerHTML = '<a class="nav-link px-3 fw-semibold" href="profile.html">Profile</a>';
  navList.appendChild(profileItem);

  // Highlight the link of the current page
  const page = location.pathname.split("/").pop() || "index.html";
  navList.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === page);
  });

  // Log In / Log Out button
  const authItem = document.createElement("li");
  authItem.className = "nav-item ms-lg-2 my-1 my-lg-0 d-flex align-items-center";
  authItem.innerHTML = user
    ? '<button id="navLogout" type="button" class="btn btn-pink btn-sm rounded-pill px-3">Log Out</button>'
    : '<button type="button" class="btn btn-pink btn-sm rounded-pill px-3" data-open-login>Log In</button>';
  navList.appendChild(authItem);
  const logoutBtn = document.getElementById("navLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem(KEYS.session);
      location.href = "index.html";
    });
  }

  // Theme toggle button
  const toggleItem = document.createElement("li");
  toggleItem.className = "nav-item ms-lg-2 my-1 my-lg-0 d-flex align-items-center";
  toggleItem.innerHTML = '<button id="themeToggle" type="button" class="btn btn-outline-pink btn-sm rounded-pill theme-toggle"></button>';
  navList.appendChild(toggleItem);

  document.getElementById("themeToggle").addEventListener("click", () => {
    const next = getTheme() === "dark" ? "light" : "dark";
    try { localStorage.setItem(KEYS.theme, next); } catch (error) { /* ignore */ }
    applyTheme(next);
  });
  applyTheme(getTheme());
}

/* ---------- 4. Sounds & small UI ---------- */
const palettes = {
  light: ["#f8f9fa", "#fff0f5", "#f3e5f5", "#e8f5e9", "#fff3e0", "#fce4ec"],
  dark: ["#1b1417", "#1c1620", "#14201a", "#241a14", "#1a1a26", "#261419"]
};
let colorIndex = 0;

let audioCtx = null;
let currentOscillator = null;

function playSound(type) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  if (!audioCtx) audioCtx = new AudioContextClass();
  if (currentOscillator) {
    try { currentOscillator.stop(); } catch (error) { /* already stopped */ }
  }

  const sounds = { success: [880, 0.3], error: [220, 0.3], star: [660, 0.18], click: [520, 0.1] };
  const [frequency, duration] = sounds[type] || sounds.click;

  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
  currentOscillator = oscillator;
}

function setupSmallUI() {
  document.querySelectorAll("button.btn").forEach(button => {
    button.addEventListener("click", () => playSound("click"));
  });

  // Background color changer (uses a dark palette in dark mode)
  const colorBtn = document.getElementById("colorBtn");
  if (colorBtn) {
    colorBtn.addEventListener("click", () => {
      const list = palettes[getTheme()];
      colorIndex = (colorIndex + 1) % list.length;
      document.body.style.backgroundImage = "none";
      document.body.style.backgroundColor = list[colorIndex];
    });
  }

  // Live date and time
  const datetimeDisplay = document.getElementById("datetime-display");
  if (datetimeDisplay) {
    const options = { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hour12: true };
    const update = () => { datetimeDisplay.textContent = new Date().toLocaleDateString("en-US", options); };
    update();
    setInterval(update, 1000);
  }

  // FAQ accordion
  document.querySelectorAll(".accordion-header").forEach(header => {
    header.addEventListener("click", () => {
      const content = header.nextElementSibling;
      const isOpen = content.style.maxHeight && content.style.maxHeight !== "0px";
      document.querySelectorAll(".accordion-content").forEach(item => { item.style.maxHeight = "0px"; });
      if (!isOpen) content.style.maxHeight = content.scrollHeight + "px";
    });
  });

  // Greeting on the home page
  const greeting = document.getElementById("greeting");
  if (greeting) {
    const hour = new Date().getHours();
    greeting.textContent = hour < 12
      ? "Good morning! Start your day with a fresh look ☀️"
      : hour < 18
        ? "Good afternoon! Time for a little self-care 🌸"
        : "Good evening! Let's get you glowing for tonight ✨";
  }

  // Star rating (saved between visits)
  const stars = document.querySelectorAll(".star");
  const ratingMessage = document.getElementById("ratingMessage");
  const ratingTexts = {
    1: "We are sorry! We will do better.",
    2: "Thanks! We will keep improving.",
    3: "Thank you for your feedback!",
    4: "Great! We are happy you liked it.",
    5: "Amazing! You made our day 💖"
  };
  const paintStars = value => stars.forEach((star, i) => star.classList.toggle("active", i < value));
  const savedRating = Number(localStorage.getItem("beautylab_rating")) || 0;
  if (savedRating) {
    paintStars(savedRating);
    if (ratingMessage) ratingMessage.textContent = ratingTexts[savedRating];
  }
  stars.forEach(star => {
    star.addEventListener("click", () => {
      const value = Number(star.dataset.value);
      paintStars(value);
      star.classList.add("star-pop");
      star.addEventListener("animationend", () => star.classList.remove("star-pop"), { once: true });
      if (ratingMessage) ratingMessage.textContent = ratingTexts[value];
      try { localStorage.setItem("beautylab_rating", value); } catch (error) { /* ignore */ }
      playSound("star");
    });
  });

  // Keyboard navigation inside the navbar (arrows, Home, End)
  document.addEventListener("keydown", event => {
    const navLinks = Array.from(document.querySelectorAll(".navbar-nav .nav-link"));
    const current = navLinks.indexOf(document.activeElement);
    if (current === -1) return;
    const moves = {
      ArrowRight: (current + 1) % navLinks.length,
      ArrowDown: (current + 1) % navLinks.length,
      ArrowLeft: (current - 1 + navLinks.length) % navLinks.length,
      ArrowUp: (current - 1 + navLinks.length) % navLinks.length,
      Home: 0,
      End: navLinks.length - 1
    };
    if (event.key in moves) {
      event.preventDefault();
      navLinks[moves[event.key]].focus();
    }
  });
}

/* Subscribe popup */
function setupPopup() {
  const modal = document.getElementById("popupModal");
  if (!modal) return;
  const closeModal = () => { modal.style.display = "none"; };

  const openBtn = document.getElementById("openPopupBtn");
  if (openBtn) openBtn.addEventListener("click", () => { modal.style.display = "flex"; });

  const closeBtn = document.getElementById("closePopup");
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  window.addEventListener("click", event => { if (event.target === modal) closeModal(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });

  const popupForm = document.getElementById("popupForm");
  if (popupForm) {
    setupForm(popupForm, () => {
      playSound("success");
      popupForm.reset();
      closeModal();
      showToast("Subscription successful! 💌");
    });
  }
}

/* Small non-blocking message (replaces alert()) */
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast-msg fade-in";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ---------- 5. Form validation ----------
   Fields declare rules in data-rules, e.g. data-rules="required|email".
   No HTML validation attributes are used; every form has novalidate. */
const validators = {
  required: value => (value.trim() ? "" : "This field is required."),
  name: value => (/^[\p{L}][\p{L}\s'-]{1,}$/u.test(value.trim()) ? "" : "Enter a valid name (letters only, at least 2 characters)."),
  email: value => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? "" : "Please enter a valid email, e.g. name@example.com."),
  phone: value => (/^\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/.test(value.trim()) ? "" : "Enter 10 digits, e.g. (707) 123-45-67."),
  futureDate: value => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    return value >= today ? "" : "Please choose today or a future date.";
  },
  password: value => {
    if (value.length < 8) return "Password must be at least 8 characters long.";
    if (!/[a-z]/.test(value) || !/[A-Z]/.test(value)) return "Use both uppercase and lowercase letters.";
    if (!/\d/.test(value)) return "Add at least one digit.";
    return "";
  }
};

function showError(input, message) {
  const group = input.closest(".mb-3, .mb-4");
  if (!group) return;
  let error = group.querySelector(".error-msg");
  if (!error) {
    error = document.createElement("small");
    error.className = "error-msg text-danger fw-semibold d-block mt-1";
    error.setAttribute("role", "alert");
    group.appendChild(error);
  }
  error.textContent = message;
  input.classList.toggle("is-invalid", Boolean(message));
}

function validateField(input) {
  const rules = (input.dataset.rules || "").split("|").filter(Boolean);
  let message = "";

  for (const rule of rules) {
    const [ruleName, argument] = rule.split(":");
    if (ruleName !== "required" && !input.value.trim()) continue; // optional empty field
    if (ruleName === "match") {
      const other = document.getElementById(argument);
      if (other && other.value !== input.value) message = "Passwords do not match.";
    } else if (validators[ruleName]) {
      message = validators[ruleName](input.value);
    }
    if (message) break;
  }

  showError(input, message);
  return !message;
}

function setupForm(form, onValid) {
  form.noValidate = true;
  const fields = Array.from(form.querySelectorAll("[data-rules]"));

  fields.forEach(field => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => { if (field.classList.contains("is-invalid")) validateField(field); });
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const results = fields.map(validateField);

    if (results.includes(false)) {
      playSound("error");
      form.classList.add("shake");
      form.addEventListener("animationend", () => form.classList.remove("shake"), { once: true });
      fields[results.indexOf(false)].focus();
      return;
    }
    onValid();
  });
}

/* ---------- 6. Auth (simulated with localStorage) ---------- */
/* Live checklist shown in the sign-up sidebar */
function setupPasswordChecklist(form) {
  const list = document.getElementById("passwordChecklist");
  if (!list) return;
  const tests = {
    length: password => password.length >= 8,
    case: password => /[a-z]/.test(password) && /[A-Z]/.test(password),
    digit: password => /\d/.test(password),
    match: (password, confirm) => password !== "" && password === confirm
  };
  const update = () => {
    list.querySelectorAll("[data-check]").forEach(item => {
      const ok = tests[item.dataset.check](form.password.value, form.confirmPassword.value);
      item.classList.toggle("check-ok", ok);
      item.querySelector(".check-icon").textContent = ok ? "✅" : "⬜";
    });
  };
  form.password.addEventListener("input", update);
  form.confirmPassword.addEventListener("input", update);
  update();
}

function setupSignup() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  // Logged-in visitors see a short message instead of the form
  const currentUser = getCurrentUser();
  if (currentUser) {
    document.getElementById("signupBox").classList.add("d-none");
    document.getElementById("signedInBox").classList.remove("d-none");
    document.getElementById("signedInName").textContent = currentUser.name;
    return;
  }
  setupPasswordChecklist(form);

  setupForm(form, () => {
    const email = form.email.value.trim().toLowerCase();
    if (getUsers().some(user => user.email === email)) {
      showError(form.email, "An account with this email already exists.");
      playSound("error");
      return;
    }
    // NOTE: plain-text password is acceptable only because this is a front-end simulation.
    const user = {
      name: form.elements.name.value.trim(),
      phone: "+7 " + form.phone.value.trim(),
      email,
      password: form.password.value,
      createdAt: new Date().toISOString()
    };
    writeJSON(KEYS.users, [...getUsers(), user]);
    localStorage.setItem(KEYS.session, email);
    playSound("success");
    location.href = "profile.html";
  });
}

/* Log In is a pop-up window available on every page (no separate login page).
   Any element with the data-open-login attribute opens it. */
function setupLoginModal() {
  if (getCurrentUser()) return;

  const modal = document.createElement("div");
  modal.id = "loginModal";
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content p-4 rounded-4 bg-white position-relative shadow-lg">
      <span id="closeLogin" class="close position-absolute top-0 end-0 p-3 fs-4">&times;</span>
      <h3 class="h5 fw-bold text-dark-pink mb-1">Welcome Back</h3>
      <p class="small text-muted mb-3">Log in to see your profile and manage bookings.</p>
      <form id="loginForm" novalidate>
        <div class="mb-3">
          <label for="loginEmail" class="form-label text-muted fw-semibold small">Email Address:</label>
          <input type="text" inputmode="email" class="form-control form-control-pink rounded-3" id="loginEmail" name="email" data-rules="required|email" placeholder="example@gmail.com" autocomplete="email">
        </div>
        <div class="mb-3">
          <label for="loginPassword" class="form-label text-muted fw-semibold small">Password:</label>
          <input type="password" class="form-control form-control-pink rounded-3" id="loginPassword" name="password" data-rules="required" placeholder="Your password" autocomplete="current-password">
        </div>
        <button type="submit" class="btn btn-pink w-100 rounded-pill fw-semibold">Log In</button>
      </form>
      <div id="loginStatus" role="alert"></div>
      <p class="text-center small text-muted mt-3 mb-0">New here? <a href="signup.html" class="text-pink fw-semibold">Create an account</a></p>
    </div>`;
  document.body.appendChild(modal);

  const form = document.getElementById("loginForm");
  const status = document.getElementById("loginStatus");
  const closeLogin = () => { modal.style.display = "none"; };

  document.addEventListener("click", event => {
    if (event.target.closest("[data-open-login]")) {
      modal.style.display = "flex";
      document.getElementById("loginEmail").focus();
    }
  });
  document.getElementById("closeLogin").addEventListener("click", closeLogin);
  modal.addEventListener("click", event => { if (event.target === modal) closeLogin(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeLogin(); });

  setupForm(form, () => {
    const email = form.email.value.trim().toLowerCase();
    const user = getUsers().find(u => u.email === email && u.password === form.password.value);
    if (!user) {
      playSound("error");
      status.className = "alert alert-danger mt-3 text-center fade-in";
      status.textContent = "Incorrect email or password. Please try again or sign up.";
      return;
    }
    localStorage.setItem(KEYS.session, user.email);
    playSound("success");
    location.href = "profile.html"; // successful login -> Profile page
  });
}

function renderBookings(user) {
  const list = document.getElementById("bookingList");
  const mine = readJSON(KEYS.bookings, []).filter(booking => booking.email === user.email);
  list.innerHTML = mine.length
    ? mine.map(booking => {
        const day = new Date(booking.date + "T00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        return `
        <li class="list-group-item d-flex justify-content-between align-items-center gap-2 price-item">
          <span class="fw-semibold">${booking.service}<br>
            <span class="small text-muted fw-normal">${day} at ${booking.time} · 🥂 ${booking.drink}</span></span>
          <button type="button" class="btn btn-outline-pink btn-sm cancel-booking" data-id="${booking.id}">Cancel</button>
        </li>`;
      }).join("")
    : '<li class="list-group-item text-muted">No booking requests yet. Book your first visit!</li>';
}

function setupProfile() {
  const card = document.getElementById("profileCard");
  if (!card) return;

  const user = getCurrentUser();
  const guestBox = document.getElementById("profileGuest");
  if (!user) { guestBox.classList.remove("d-none"); return; }
  card.classList.remove("d-none");

  document.getElementById("profileAvatar").textContent = user.name.charAt(0).toUpperCase();
  document.getElementById("profileName").textContent = user.name;
  document.getElementById("profileEmail").textContent = user.email;
  document.getElementById("profilePhone").textContent = user.phone;
  document.getElementById("profileSince").textContent = new Date(user.createdAt)
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  renderBookings(user);
  document.getElementById("bookingList").addEventListener("click", event => {
    const button = event.target.closest(".cancel-booking");
    if (!button) return;
    const remaining = readJSON(KEYS.bookings, []).filter(booking => String(booking.id) !== button.dataset.id);
    writeJSON(KEYS.bookings, remaining);
    renderBookings(user);
    showToast("Booking request cancelled.");
  });

  // Last search saved by the Price Finder
  const saved = readJSON(KEYS.filter, null);
  const savedBox = document.getElementById("savedSearch");
  if (savedBox) {
    savedBox.textContent = saved && (saved.query || saved.category !== "all")
      ? `Category: ${saved.category}${saved.query ? ', search: "' + saved.query + '"' : ""}`
      : "No saved search yet.";
  }

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem(KEYS.session);
    location.href = "index.html";
  });
}

/* ---------- 7. Price finder (search + filter, saved in localStorage) ---------- */
const services = [
  { name: "Day Makeup", category: "makeup", price: 9000 },
  { name: "Evening Makeup", category: "makeup", price: 15000 },
  { name: "Bridal Makeup", category: "makeup", price: 17000 },
  { name: "Styling / Blowout", category: "hair", price: 8000 },
  { name: "Curls", category: "hair", price: 10000 },
  { name: "Updo Bun", category: "hair", price: 7000 },
  { name: "Nails Length 1-2", category: "nails", price: 8000 },
  { name: "Nails Length 3-4", category: "nails", price: 10000 },
  { name: "French Add-on", category: "nails", price: 1000 },
  { name: "Design Add-on", category: "nails", price: 1000 }
];

const priceFormatter = {
  currency: "KZT",
  format(amount) { return amount.toLocaleString("en-US") + " " + this.currency; }
};

function setupPriceFinder() {
  const priceList = document.getElementById("priceList");
  if (!priceList) return;

  const priceTotal = document.getElementById("priceTotal");
  const searchInput = document.getElementById("serviceSearch");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const state = Object.assign({ category: "all", query: "" }, readJSON(KEYS.filter, {}));

  function render() {
    const query = state.query.trim().toLowerCase();
    const filtered = services.filter(service =>
      (state.category === "all" || service.category === state.category) &&
      service.name.toLowerCase().includes(query));

    priceList.innerHTML = filtered.length
      ? filtered.map(service => `
          <li class="list-group-item d-flex justify-content-between align-items-center price-item">
            <span>${service.name}</span>
            <span class="fw-bold text-dark-pink">${priceFormatter.format(service.price)}</span>
          </li>`).join("")
      : '<li class="list-group-item text-muted price-item">No services match your search.</li>';

    const total = filtered.reduce((sum, service) => sum + service.price, 0);
    priceTotal.textContent = `${filtered.length} services, total: ${priceFormatter.format(total)}`;

    filterButtons.forEach(btn => btn.classList.toggle("active-filter", btn.dataset.category === state.category));
    writeJSON(KEYS.filter, state); // remember the last search / category
  }

  filterButtons.forEach(button => {
    button.addEventListener("click", () => { state.category = button.dataset.category; render(); });
  });
  if (searchInput) {
    searchInput.value = state.query;
    searchInput.addEventListener("input", () => { state.query = searchInput.value; render(); });
  }
  render();
}

/* ---------- 8. Weather API (Open-Meteo, no key needed) ---------- */
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast?latitude=51.13&longitude=71.43" +
  "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto";

function describeWeather(code) {
  if (code === 0) return ["Clear sky", "☀️"];
  if (code <= 3) return ["Partly cloudy", "⛅"];
  if (code <= 48) return ["Foggy", "🌫️"];
  if (code <= 67 || (code >= 80 && code <= 82)) return ["Rain", "🌧️"];
  if (code <= 77 || (code >= 85 && code <= 86)) return ["Snow", "❄️"];
  return ["Thunderstorm", "⛈️"];
}

async function loadWeather() {
  const box = document.getElementById("weatherBox");
  if (!box) return;

  box.innerHTML = '<div class="text-center text-muted small"><span class="spinner-border spinner-border-sm text-pink me-2"></span>Loading weather...</div>';
  try {
    const response = await fetch(WEATHER_URL);
    if (!response.ok) throw new Error("Weather request failed");
    const { current } = await response.json();

    const [label, icon] = describeWeather(current.weather_code);
    const temp = Math.round(current.temperature_2m);
    let tip = "Great weather for a fresh new look!";
    if (["Rain", "Snow", "Thunderstorm"].includes(label)) tip = "Take an umbrella, we will happily fix your hair and makeup!";
    else if (temp <= 0) tip = "Cold outside? Warm up with a herbal tea on us ☕";

    box.innerHTML = `
      <div class="d-flex align-items-center gap-3 fade-in">
        <span class="weather-icon">${icon}</span>
        <div>
          <div class="h3 fw-bold text-dark-pink mb-0">${temp}°C</div>
          <div class="small text-muted">${label} · feels like ${Math.round(current.apparent_temperature)}°C</div>
        </div>
      </div>
      <p class="small text-muted mt-3 mb-0">${tip}</p>`;
  } catch (error) {
    box.innerHTML = `
      <p class="small text-danger mb-2">Could not load the weather. Check your connection.</p>
      <button id="weatherRetry" class="btn btn-outline-pink btn-sm w-100">Try again</button>`;
    document.getElementById("weatherRetry").addEventListener("click", loadWeather);
  }
}

/* ---------- 9. Booking form (contact page) + history ---------- */
function sendContactData(data, callback) {
  // Public test API: echoes the data back with a fake request id
  fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (!response.ok) throw new Error("Server error");
      return response.json();
    })
    .then(result => callback(null, result))
    .catch(error => callback(error, null));
}

function setupBooking() {
  const form = document.getElementById("bookingForm");
  if (!form) return;

  // Only logged-in clients see the booking form (requests are linked to the profile)
  const user = getCurrentUser();
  document.getElementById("bookingGate").classList.toggle("d-none", Boolean(user));
  document.getElementById("bookingBox").classList.toggle("d-none", !user);
  if (!user) return;

  document.getElementById("bookingAs").textContent = `Booking as ${user.name} (${user.email})`;
  form.phone.value = user.phone.replace("+7 ", "");
  const status = document.getElementById("formStatus");

  setupForm(form, () => {
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = Object.fromEntries(new FormData(form));
    submitBtn.disabled = true;
    status.className = "alert alert-pink mt-3 text-center";
    status.textContent = "Sending...";

    sendContactData({ name: user.name, email: user.email, ...formData }, (error, result) => {
      submitBtn.disabled = false;
      if (error) {
        playSound("error");
        status.className = "alert alert-danger mt-3 text-center";
        status.textContent = "Something went wrong. Please try again.";
        return;
      }

      playSound("success");
      status.className = "alert alert-success mt-3 text-center fade-in";
      status.textContent = `Thank you, ${user.name}! Your request #${result.id} was sent. We will contact you soon.`;

      // Keep the request so it appears (and can be cancelled) on the profile page
      writeJSON(KEYS.bookings, [...readJSON(KEYS.bookings, []), {
        id: Date.now(),
        email: user.email,
        service: form.service.options[form.service.selectedIndex].text,
        drink: form.drink.options[form.drink.selectedIndex].text,
        date: formData.date,
        time: formData.time
      }]);
      form.reset();
      form.phone.value = user.phone.replace("+7 ", "");
    });
  });
}

/* ---------- Init ---------- */
applyTheme(getTheme());
setupNavbar();
setupSmallUI();
setupPopup();
setupSignup();
setupLoginModal();
setupProfile();
setupPriceFinder();
loadWeather();
setupBooking();
