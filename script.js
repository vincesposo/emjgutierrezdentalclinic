// Replace this with your deployed Google Apps Script Web App /exec URL.
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw9L9fXMke4VudgLz3bzyFELg4szV7whn9BvXHWeDOz8YwV1NFBRi2-wlGnUAXptoEEsQ/exec";

const form = document.getElementById("appointmentForm");
const submitButton = document.getElementById("submitButton");
const result = document.getElementById("result");

document.getElementById("year").textContent = new Date().getFullYear();

const dateInput = document.querySelector('input[name="date"]');
dateInput.min = new Date().toISOString().split("T")[0];

function showResult(message, type) {
  result.className = "result " + type;
  result.innerHTML = message;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (APPS_SCRIPT_URL.includes("PASTE_YOUR")) {
    showResult("Please configure your Google Apps Script Web App URL in script.js first.", "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  try {
    const formData = new FormData(form);
    const body = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      body.append(key, value);
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Unable to submit appointment.");
    }

    showResult(
      `<strong>Appointment request received!</strong><br>
       Your Appointment ID is <strong>${escapeHtml(data.appointmentId)}</strong>.<br>
       Please check your email and SMS for the pending notification.`,
      "success"
    );

    form.reset();
    dateInput.min = new Date().toISOString().split("T")[0];
  } catch (error) {
    showResult(
      `<strong>Submission failed.</strong><br>${escapeHtml(error.message)}<br>
       Please check your internet connection or contact the clinic.`,
      "error"
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit Appointment Request";
  }
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// QR code for the current page URL.
const currentUrl = window.location.href;
document.getElementById("qrUrl").textContent = currentUrl;

new QRCode(document.getElementById("qrcode"), {
  text: currentUrl,
  width: 190,
  height: 190,
  correctLevel: QRCode.CorrectLevel.H
});

document.getElementById("downloadQr").addEventListener("click", () => {
  const canvas = document.querySelector("#qrcode canvas");
  const image = document.querySelector("#qrcode img");

  if (canvas) {
    const link = document.createElement("a");
    link.download = "emj-dental-appointment-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  } else if (image) {
    const link = document.createElement("a");
    link.download = "emj-dental-appointment-qr.png";
    link.href = image.src;
    link.click();
  }
});

document.getElementById("printQr").addEventListener("click", () => {
  const qr = document.getElementById("qrcode").innerHTML;
  const popup = window.open("", "_blank", "width=500,height=600");
  popup.document.write(`
    <!doctype html><html><head><title>EMJ Dental Clinic QR Code</title>
    <style>body{font-family:Arial;text-align:center;padding:40px}img,canvas{max-width:100%}</style>
    </head><body><h1>EMJ Dental Clinic</h1><h2>Scan to Book an Appointment</h2>${qr}
    <p>${escapeHtml(currentUrl)}</p><script>window.print();<\/script></body></html>
  `);
  popup.document.close();
});
