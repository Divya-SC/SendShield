let warningDisplayed = false;
let walletDatabase = {};
fetch(chrome.runtime.getURL("wallets.json"))
  .then(response => response.json())
  .then(data => {
    walletDatabase = data;
    console.log("SendShield database loaded");
  });
function showWarning(type, title, message) {
  if (warningDisplayed) {
  return;
}

warningDisplayed = true;

  const existingBanner =
    document.getElementById("SendShield-banner");

  if (existingBanner) {
    existingBanner.remove();
  }

  const banner = document.createElement("div");

  banner.id = "SendShield-banner";

 banner.innerHTML = `
  <div style="
    font-size:28px;
    font-weight:bold;
    margin-bottom:15px;
  ">
    ${title}
  </div>

  <div style="
    font-size:18px;
    line-height:1.6;
    margin-bottom:20px;
  ">
    ${message}
  </div>

  <button
    id="SendShield-cancel"
    style="
      background:#dc2626;
      color:white;
      border:none;
      padding:14px;
      border-radius:10px;
      cursor:pointer;
      font-weight:bold;
      width:100%;
      font-size:16px;
    "
  >
    Cancel Transaction
  </button>
`;

  banner.style.position = "fixed";
  banner.style.background = "#111827";
  banner.style.top = "50%";
  banner.style.left = "50%";
  banner.style.transform = "translate(-50%, -50%)";
  banner.style.textAlign = "center";
  banner.style.zIndex = "999999";
  banner.style.width = "500px";
  banner.style.maxWidth = "90%";
  banner.style.padding = "24px";
  banner.style.borderRadius = "20px";
  banner.style.color = "white";
  banner.style.fontFamily = "Arial, sans-serif";
  banner.style.boxShadow = "0 10px 30px rgba(0,0,0,0.4)";

  if (type === "blocked") {
    banner.style.background = "#1f2937";
    banner.style.backdropFilter = "none";
    banner.style.opacity = "1";
    banner.style.border = "2px solid #d4d4d8";
  }

  if (type === "scam") {
    banner.style.background = "#92400e";
    banner.style.backdropFilter = "none";
    banner.style.opacity = "1";
    banner.style.border = "2px solid #ef4444";
  }

  document.body.appendChild(banner);

  document
    .getElementById("SendShield-cancel")
    .addEventListener("click", () => {

  banner.remove();

  warningDisplayed = false;
    });
}

function checkPageForWallets() {

  const pageText =
    document.body.innerText.toLowerCase();

  sanctionedWallets.forEach(wallet => {

    if (pageText.includes(wallet)) {

      showWarning(
        "blocked",
        "🚫 SendShield Warning",
        "🚫 This wallet appears on sanctions lists.<br><br>Do not send funds."
      );

    }

  });

  scamWallets.forEach(wallet => {

    if (pageText.includes(wallet)) {

      showWarning(
        "scam",
        "🔴 SendShield Warning",
        "Fraud reports detected. Do not send funds."
      );

    }

  });

}

document.addEventListener("input", function(event) {

  const value =
    event.target.value?.toLowerCase();

  const existingBanner =
    document.getElementById("SendShield-banner");

  if (
    existingBanner &&
    !walletDatabase[value]) 
    {existingBanner.remove();
      warningDisplayed = false;
    }

  if (!value) {
    return;
  }

const walletInfo = walletDatabase[value];

if (walletInfo) {

  showWarning(
    walletInfo.type,
    walletInfo.title,
    walletInfo.message
  );

}

});
walletDatabase