const SENDSHIELD_API =
  "https://sendshield-api.divya-sc87.workers.dev";

let warningDisplayed = false;


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
  font-size:14px;
  opacity:0.9;
  margin-bottom:8px;
">
<div style="
  font-size:32px;
  font-weight:bold;
  margin-bottom:25px;
">
  ${title}
</div>
  Risk Category
</div>

<div style="
  font-size:22px;
  font-weight:bold;
  margin-bottom:20px;
">
  ${window.SendShieldLabel || "Risk Indicator"}
</div>

<div style="
  font-size:14px;
  opacity:0.9;
  margin-bottom:8px;
">
  Source
</div>

<div style="
  font-size:18px;
  margin-bottom:18px;
">
  ${window.SendShieldSource || "SendShield Database"}
</div>

<div style="
  font-size:14px;
  opacity:0.9;
  margin-bottom:8px;
">
  Reason
</div>

<div style="
  font-size:17px;
  line-height:1.6;
  margin-bottom:25px;
">
  ${message}
</div>

<div style="
  font-size:12px;
  opacity:0.8;
  margin-bottom:20px;
">
  SendShield Threat Intelligence
</div>

  <button
    id="SendShield-cancel"
    style="
      background:#dc2626;
      color:white;
      border:none;
      padding:14px 20px;
      border-radius:10px;
      cursor:pointer;
      font-size:16px;
      font-weight:bold;
    "
  >
    Review Address
  </button>
`;

  banner.style.position = "fixed";
  banner.style.top = "50%";
  banner.style.left = "50%";
  banner.style.transform = "translate(-50%, -50%)";
  banner.style.zIndex = "999999";
  banner.style.width = "460px";
  banner.style.maxWidth = "90%";
  banner.style.padding = "30px";
  banner.style.borderRadius = "20px";
  banner.style.textAlign = "center";
  banner.style.color = "white";
  banner.style.fontFamily = "Arial, sans-serif";
  banner.style.boxShadow = "0 10px 30px rgba(0,0,0,0.4)";

if (type === "blocked") {
  banner.style.background = "#1f2937";
  banner.style.border = "3px solid #9ca3af";
}

if (type === "scam") {
  banner.style.background = "#7f1d1d";
  banner.style.border = "3px solid #ef4444";
}

if (type === "warning") {
  banner.style.background = "#92400e";
  banner.style.border = "3px solid #f59e0b";
}

  document.body.appendChild(banner);

  document
    .getElementById("SendShield-cancel")
    .addEventListener("click", () => {

      banner.remove();
      warningDisplayed = false;

    });
}

// Detect wallet input
document.addEventListener("input", async function(event) {

  const value =
    event.target.value?.trim().toLowerCase();

  if (!value) {
    return;
  }

  try {

    const response = await fetch(
      `${SENDSHIELD_API}/?address=${value}`
    );

    const result = await response.json();

    if (result.found) {

      window.SendShieldLabel = result.label;
      window.SendShieldSource = result.source;

showWarning(
  result.risk,
  result.title,
  result.message
);

    }

  } catch (error) {

    console.error(
      "SendShield API error",
      error
    );

  }

});