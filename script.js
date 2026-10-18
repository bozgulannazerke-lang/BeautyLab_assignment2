const colors = ["#f8f9fa", "#fff0f5", "#f3e5f5", "#e8f5e9", "#fff3e0", "#fce4ec"];
let colorIndex = 0;
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
        const options = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
        datetimeDisplay.textContent = now.toLocaleDateString('en-US', options);
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

if (openPopupBtn && modal) {
    openPopupBtn.addEventListener("click", () => {
        modal.style.display = "flex";
    });
}

if (closePopup && modal) {
    closePopup.addEventListener("click", () => {
        modal.style.display = "none";
    });
}

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
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
            alert("Registration successful!");
            regForm.reset();
        }
    });
}

const popupForm = document.getElementById("popupForm");
if (popupForm) {
    popupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Subscription successful!");
        popupForm.reset();
        if (modal) modal.style.display = "none";
    });
}