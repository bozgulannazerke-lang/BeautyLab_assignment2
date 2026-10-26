const colors = ["#f8f9fa", "#fff0f5", "#f3e5f5", "#e8f5e9", "#fff3e0", "#fce4ec"];
let colorIndex = 0;

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
  format(amount) {
    return amount.toLocaleString("en-US") + " " + this.currency;
  }
};

let audioCtx = null;
let currentOscillator = null; 

function playSound(type) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  if (!audioCtx) audioCtx = new AudioContextClass();

  if (currentOscillator) {
    try { currentOscillator.stop(); } catch (error) { }
  }

  let frequency;
  let duration;

  switch (type) {
    case "success":
      frequency = 880;
      duration = 0.3;
      break;
    case "error":
      frequency = 220;
      duration = 0.3;
      break;
    case "star":
      frequency = 660;
      duration = 0.18;
      break;
    default:
      frequency = 520;
      duration = 0.1;
  }

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

document.querySelectorAll("button.btn").forEach(button => {
  button.addEventListener("click", () => playSound("click"));
});

const colorBtn = document.getElementById("colorBtn");

if (colorBtn) {
  colorBtn.addEventListener("click", () => {
    colorIndex = (colorIndex + 1) % colors.length;
    document.body.style.backgroundImage = "none";
    document.body.style.backgroundColor = colors[colorIndex];
  });
}

function updateDateTime() {
  const datetimeDisplay = document.getElementById("datetime-display");
  if (datetimeDisplay) {
    const now = new Date();
    const options = { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hour12: true };
    datetimeDisplay.textContent = now.toLocaleDateString("en-US", options);
  }
}

setInterval(updateDateTime, 1000);
updateDateTime();

const accordionHeaders = document.querySelectorAll(".accordion-header");

accordionHeaders.forEach(header => {
  header.addEventListener("click", () => {
    const content = header.nextElementSibling;
    const isOpen = content.style.maxHeight && content.style.maxHeight !== "0px";
    document.querySelectorAll(".accordion-content").forEach(item => {
      item.style.maxHeight = "0px";
    });

    if (!isOpen) {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
});

const modal = document.getElementById("popupModal");
const openPopupBtn = document.getElementById("openPopupBtn");
const closePopup = document.getElementById("closePopup");

function closeModal() {
  if (modal) modal.style.display = "none";
}

if (openPopupBtn && modal) {
  openPopupBtn.addEventListener("click", () => {
    modal.style.display = "flex";
  });
}

if (closePopup && modal) {
  closePopup.addEventListener("click", closeModal);
}

window.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "Escape":
      closeModal();
      break;
    default:
      break;
  }
});

const regForm = document.getElementById("regForm");
if (regForm) {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");

  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const confirmError = document.getElementById("confirmError");

  regForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let isValid = true;

    if (emailError) emailError.textContent = "";
    if (passwordError) passwordError.textContent = "";
    if (confirmError) confirmError.textContent = "";

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput && !emailPattern.test(emailInput.value)) {
      if (emailError) emailError.textContent = "Please enter a valid email address.";
      isValid = false;
    }

    if (passwordInput && passwordInput.value.length < 6) {
      if (passwordError) passwordError.textContent = "Password must be at least 6 characters long.";
      isValid = false;
    }

    if (passwordInput && confirmInput && passwordInput.value !== confirmInput.value) {
      if (confirmError) confirmError.textContent = "Passwords do not match.";
      isValid = false;
    }

    if (isValid) {
      playSound("success");
      alert("Registration successful!");
      regForm.reset();
    } else {
      playSound("error");
      regForm.classList.add("shake");
      regForm.addEventListener("animationend", () => regForm.classList.remove("shake"), { once: true });
    }
  });
}

const popupForm = document.getElementById("popupForm");
if (popupForm) {
  popupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    playSound("success");
    alert("Subscription successful!");
    popupForm.reset();
    closeModal();
  });
}

function getGreeting(hour) {
  switch (true) {
    case hour < 12:
      return "Good morning! Start your day with a fresh look ☀️";
    case hour < 18:
      return "Good afternoon! Time for a little self-care 🌸";
    default:
      return "Good evening! Let's get you glowing for tonight ✨";
  }
}

const greetingElement = document.getElementById("greeting");
if (greetingElement) {
  greetingElement.textContent = getGreeting(new Date().getHours());
}

document.addEventListener("keydown", (e) => {
  const links = Array.from(document.querySelectorAll(".navbar-nav .nav-link"));
  const currentIndex = links.indexOf(document.activeElement);
  if (currentIndex === -1) return; 

  switch (e.key) {
    case "ArrowRight":
    case "ArrowDown":
      e.preventDefault();
      links[(currentIndex + 1) % links.length].focus();
      break;
    case "ArrowLeft":
    case "ArrowUp":
      e.preventDefault();
      links[(currentIndex - 1 + links.length) % links.length].focus();
      break;
    case "Home":
      e.preventDefault();
      links[0].focus();
      break;
    case "End":
      e.preventDefault();
      links[links.length - 1].focus();
      break;
    default:
      break;
  }
});

const stars = document.querySelectorAll(".star");
const ratingMessage = document.getElementById("ratingMessage");

const ratingTexts = {
  1: "We are sorry! We will do better.",
  2: "Thanks! We will keep improving.",
  3: "Thank you for your feedback!",
  4: "Great! We are happy you liked it.",
  5: "Amazing! You made our day 💖"
};

stars.forEach(star => {
  star.addEventListener("click", () => {
    const value = Number(star.dataset.value);

    for (let i = 0; i < stars.length; i++) {
      stars[i].classList.toggle("active", i < value);
    }

    star.classList.add("star-pop");
    star.addEventListener("animationend", () => star.classList.remove("star-pop"), { once: true });

    if (ratingMessage) ratingMessage.textContent = ratingTexts[value];
    playSound("star");
  });
});

const priceList = document.getElementById("priceList");
const priceTotal = document.getElementById("priceTotal");
const filterButtons = document.querySelectorAll(".filter-btn");

function renderServices(category) {
  if (!priceList) return;

  const filtered = category === "all"
    ? services
    : services.filter(service => service.category === category);

  priceList.innerHTML = filtered
    .map(service => `
      <li class="list-group-item d-flex justify-content-between align-items-center price-item">
        <span>${service.name}</span>
        <span class="fw-bold text-dark-pink">${priceFormatter.format(service.price)}</span>
      </li>`)
    .join("");

  const total = filtered.reduce((sum, service) => sum + service.price, 0);
  if (priceTotal) {
    priceTotal.textContent = `${filtered.length} services, total: ${priceFormatter.format(total)}`;
  }
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active-filter"));
    button.classList.add("active-filter");
    renderServices(button.dataset.category);
  });
});

renderServices("all");

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

function sendContactData(data, callback) {
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

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const formData = Object.fromEntries(new FormData(contactForm));

    submitBtn.disabled = true;
    formStatus.className = "alert alert-pink mt-3 text-center";
    formStatus.textContent = "Sending...";

    sendContactData(formData, (error, result) => {
      submitBtn.disabled = false;

      if (error) {
        playSound("error");
        formStatus.className = "alert alert-danger mt-3 text-center";
        formStatus.textContent = "Something went wrong. Please try again.";
        return;
      }

      playSound("success");
      formStatus.className = "alert alert-success mt-3 text-center fade-in";
      formStatus.textContent = `Thank you, ${formData.name}! Your request #${result.id} was sent. We will contact you soon.`;
      contactForm.reset();
    });
  });
}