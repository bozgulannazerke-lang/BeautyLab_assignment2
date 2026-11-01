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
 
function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
 
function showToast(message, type) {
  const kind = type || "info";
  const icons = { success: "✓", error: "!", info: "i" };
  let $container = $("#toastContainer");
 
  if (!$container.length) {
    $container = $('<div id="toastContainer"></div>').appendTo("body");
  }
 
  $('<div class="toast-note toast-' + kind + '"></div>')
    .append($('<span class="toast-icon"></span>').text(icons[kind]))
    .append($('<span class="toast-text"></span>').text(message))
    .hide()
    .appendTo($container)
    .fadeIn(300)
    .delay(2800)
    .fadeOut(500, function () {
      $(this).remove();
    });
}
 
function setLoading($btn, isLoading) {
  if (isLoading) {
    $btn
      .data("originalHtml", $btn.html())
      .prop("disabled", true)
      .html('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Please wait...');
  } else {
    $btn.prop("disabled", false).html($btn.data("originalHtml"));
  }
}
 
function simulateRequest($btn, delay, done) {
  if ($btn.prop("disabled")) return;
  setLoading($btn, true);
  setTimeout(function () {
    setLoading($btn, false);
    done();
  }, delay);
}
 
function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
 
  return new Promise(function (resolve, reject) {
    const $temp = $("<textarea></textarea>")
      .val(text)
      .css({ position: "fixed", top: 0, left: 0, opacity: 0 })
      .appendTo("body");
    $temp[0].select();
    const success = document.execCommand("copy");
    $temp.remove();
    if (success) resolve();
    else reject();
  });
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
      simulateRequest($(regForm).find('button[type="submit"]'), 1500, function () {
        playSound("success");
        showToast("Registration successful!", "success");
        regForm.reset();
      });
    } else {
      playSound("error");
      showToast("Please fix the errors in the form.", "error");
      regForm.classList.add("shake");
      regForm.addEventListener("animationend", () => regForm.classList.remove("shake"), { once: true });
    }
  });
}
 
const popupForm = document.getElementById("popupForm");
if (popupForm) {
  popupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    simulateRequest($(popupForm).find('button[type="submit"]'), 1200, function () {
      playSound("success");
      showToast("Subscription successful!", "success");
      popupForm.reset();
      closeModal();
    });
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
    showToast("Thanks for rating us " + value + " out of 5!", "success");
  });
});
 
const priceList = document.getElementById("priceList");
const filterButtons = document.querySelectorAll(".filter-btn");
 
function applyServiceSearch() {
  const term = ($("#serviceSearch").val() || "").trim().toLowerCase();
  const $items = $("#priceList .price-item");
 
  const $matched = $items.filter(function () {
    return $(this).text().toLowerCase().indexOf(term) !== -1;
  });
 
  $items.addClass("d-none");
  $matched.removeClass("d-none");
 
  let total = 0;
  $matched.each(function () {
    total += Number($(this).attr("data-price"));
  });
 
  $("#priceTotal").text($matched.length + " services, total: " + priceFormatter.format(total));
  $("#noResults").toggleClass("d-none", $matched.length !== 0);
}
 
function renderServices(category) {
  if (!priceList) return;
 
  const filtered = category === "all"
    ? services
    : services.filter(service => service.category === category);
 
  priceList.innerHTML = filtered
    .map(service => `
      <li class="list-group-item d-flex justify-content-between align-items-center price-item" data-price="${service.price}">
        <span>${service.name}</span>
        <span class="fw-bold text-dark-pink">${priceFormatter.format(service.price)}</span>
      </li>`)
    .join("");
 
  applyServiceSearch();
}
 
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active-filter"));
    button.classList.add("active-filter");
    renderServices(button.dataset.category);
  });
});
 
renderServices("all");
 
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
 
function initServiceSearch() {
  const $input = $("#serviceSearch");
  if (!$input.length) return;
 
  const $box = $("#suggestBox");
  const names = services.map(service => service.name);
  let activeIndex = -1;
 
  function closeSuggestions() {
    $box.empty().removeClass("open");
    activeIndex = -1;
  }
 
  function showSuggestions(term) {
    const matches = names
      .filter(name => name.toLowerCase().indexOf(term) !== -1)
      .slice(0, 6);
 
    if (!term || !matches.length) {
      closeSuggestions();
      return;
    }
 
    const pattern = new RegExp("(" + escapeRegExp(term) + ")", "gi");
    $box.empty();
 
    $.each(matches, function (index, name) {
      $("<li></li>")
        .addClass("suggest-item")
        .attr("data-value", name)
        .html(name.replace(pattern, "<strong>$1</strong>"))
        .appendTo($box);
    });
 
    $box.addClass("open");
    activeIndex = -1;
  }
 
  function chooseSuggestion(value) {
    $input.val(value);
    closeSuggestions();
    applyServiceSearch();
  }
 
  $input.on("input", function () {
    const term = $(this).val().trim().toLowerCase();
    applyServiceSearch();
    showSuggestions(term);
  });
 
  $input.on("keydown", function (e) {
    const $items = $box.children();
    if (!$items.length) return;
 
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % $items.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + $items.length) % $items.length;
    } else if (e.key === "Enter") {
      if (activeIndex > -1) {
        e.preventDefault();
        chooseSuggestion($items.eq(activeIndex).attr("data-value"));
      }
      return;
    } else if (e.key === "Escape") {
      closeSuggestions();
      return;
    } else {
      return;
    }
 
    $items.removeClass("active").eq(activeIndex).addClass("active");
  });
 
  $box.on("click", ".suggest-item", function () {
    chooseSuggestion($(this).attr("data-value"));
  });
 
  $(document).on("click", function (e) {
    if (!$(e.target).closest("#searchWrap").length) closeSuggestions();
  });
}
 
function initFaqHighlight() {
  const $input = $("#faqSearch");
  if (!$input.length) return;
 
  const $targets = $(".faq-text");
  const $count = $("#faqCount");
 
  $targets.each(function () {
    $(this).data("original", $(this).html());
  });
 
  $input.on("input", function () {
    const term = $(this).val().trim();
 
    if (!term) {
      $targets.each(function () {
        $(this).html($(this).data("original"));
      });
      $(".accordion-content").css("max-height", "0px");
      $count.text("");
      return;
    }
 
    const pattern = new RegExp(escapeRegExp(term), "gi");
    let total = 0;
 
    $targets.each(function () {
      const original = $(this).data("original");
      const found = original.match(pattern);
      if (found) total += found.length;
      $(this).html(original.replace(pattern, function (match) {
        return '<mark class="hl">' + match + "</mark>";
      }));
    });
 
    $(".accordion-item").each(function () {
      const $content = $(this).find(".accordion-content");
      const hasMatch = $(this).find("mark.hl").length > 0;
      $content.css("max-height", hasMatch ? $content.prop("scrollHeight") + "px" : "0px");
    });
 
    $count.text(total ? total + (total === 1 ? " match found" : " matches found") : "No matches found");
  });
}
 
function initScrollProgress() {
  $("body").prepend('<div id="scrollProgress"><div id="scrollProgressBar"></div></div>');
  const $bar = $("#scrollProgressBar");
 
  function update() {
    const scrollTop = $(window).scrollTop();
    const maxScroll = $(document).height() - $(window).height();
    const percent = maxScroll > 0 ? Math.min(100, (scrollTop / maxScroll) * 100) : 0;
    $bar.css("width", percent + "%").toggleClass("started", percent > 0);
  }
 
  $(window).on("scroll resize", update);
  update();
}
 
function initCounters() {
  const $numbers = $(".stat-number");
  if (!$numbers.length) return;
 
  function run() {
    const viewBottom = $(window).scrollTop() + $(window).height();
 
    $numbers.not(".counted").each(function () {
      const $el = $(this);
      if ($el.offset().top > viewBottom - 40) return;
 
      $el.addClass("counted");
      const target = Number($el.data("target"));
      const suffix = $el.data("suffix") || "";
 
      $({ value: 0 }).animate({ value: target }, {
        duration: 2200,
        easing: "swing",
        step: function (now) {
          $el.text(Math.floor(now).toLocaleString("en-US") + suffix);
        },
        complete: function () {
          $el.text(target.toLocaleString("en-US") + suffix);
        }
      });
    });
  }
 
  $(window).on("scroll resize load", run);
  run();
}
 
function initContactForm() {
  const $form = $("#contactForm");
  if (!$form.length) return;
 
  const $status = $("#formStatus");
 
  $form.on("submit", function (e) {
    e.preventDefault();
 
    const $btn = $form.find('button[type="submit"]');
    if ($btn.prop("disabled")) return;
 
    const formData = Object.fromEntries(new FormData(this));
    setLoading($btn, true);
    $status.attr("class", "").text("");
 
    const delay = new Promise(function (resolve) {
      setTimeout(resolve, 1500);
    });
 
    const request = new Promise(function (resolve) {
      sendContactData(formData, function (error, result) {
        resolve({ error: error, result: result });
      });
    });
 
    Promise.all([delay, request]).then(function (values) {
      const outcome = values[1];
      setLoading($btn, false);
 
      if (outcome.error) {
        playSound("error");
        showToast("Something went wrong. Please try again.", "error");
        $status.attr("class", "alert alert-danger mt-3 text-center").text("Something went wrong. Please try again.");
        return;
      }
 
      playSound("success");
      showToast("Message sent successfully!", "success");
      $status
        .attr("class", "alert alert-success mt-3 text-center fade-in")
        .text("Thank you, " + formData.name + "! Your request #" + outcome.result.id + " was sent. We will contact you soon.");
      $form[0].reset();
    });
  });
}
 
function initCopyButtons() {
  const $buttons = $(".copy-btn");
  if (!$buttons.length) return;
 
  $buttons.on("click", function () {
    const $btn = $(this);
    const $tooltip = $btn.siblings(".copy-tooltip");
 
    copyText($btn.attr("data-copy"))
      .then(function () {
        clearTimeout($btn.data("timer"));
        $btn.addClass("copied");
        $tooltip.stop(true, true).fadeIn(150).delay(1500).fadeOut(250);
        showToast($btn.attr("data-label") + " copied to clipboard", "success");
        $btn.data("timer", setTimeout(function () {
          $btn.removeClass("copied");
        }, 2000));
      })
      .catch(function () {
        showToast("Could not copy. Please copy it manually.", "error");
      });
  });
 
  $(".copy-text").on("copy", function () {
    showToast("Text copied to clipboard", "success");
  });
}
 
function initLazyLoading() {
  if (!$("img.lazy").length) return;
 
  function loadVisible() {
    const viewTop = $(window).scrollTop();
    const viewBottom = viewTop + $(window).height();
 
    $("img.lazy[data-src]").each(function () {
      const $img = $(this);
      const $carousel = $img.closest(".carousel");
      const $target = $carousel.length ? $carousel : $img;
      const top = $target.offset().top;
      const bottom = top + $target.outerHeight();
 
      if (bottom >= viewTop - 150 && top <= viewBottom + 150) {
        $img.one("load error", function () {
          $img.addClass("lazy-loaded");
        });
        $img.attr("src", $img.attr("data-src")).removeAttr("data-src");
      }
    });
  }
 
  $(window).on("scroll resize load", loadVisible);
  loadVisible();
}
 
$(document).ready(function () {
  console.log("jQuery is ready!");
  initScrollProgress();
  initServiceSearch();
  initFaqHighlight();
  initCounters();
  initContactForm();
  initCopyButtons();
  initLazyLoading();
});