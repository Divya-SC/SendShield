const form = document.getElementById("riskForm");
const result = document.getElementById("result");
const generateReportButton = document.getElementById("generateReport");
const reportSection = document.getElementById("reportSection");
const reportOutput = document.getElementById("reportOutput");
const downloadPdfButton = document.getElementById("downloadPdf");

let latestScan = null;

const sanctionedWallets = {
  "0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a": {
    source: "OFAC SDN",
    entity: "SECONDEYE SOLUTION",
    program: "CYBER2 / ELECTION-EO13848",
    asset: "ETH"
  },
  "0x7db418b5d567a4e0e8c59ad71be1fce48f3e6107": {
    source: "OFAC SDN",
    entity: "SECONDEYE SOLUTION",
    program: "CYBER2 / ELECTION-EO13848",
    asset: "ETH"
  },
  "0x72a5843cc08275c8171e582972aa4fda8c397b2a": {
    source: "OFAC SDN",
    entity: "SECONDEYE SOLUTION",
    program: "CYBER2 / ELECTION-EO13848",
    asset: "ETH"
  },
  "0x7f19720a857f834887fc9a7bc0a0fbe7fc7f8102": {
    source: "OFAC SDN",
    entity: "SECONDEYE SOLUTION",
    program: "CYBER2 / ELECTION-EO13848",
    asset: "ETH"
  }
};

const scamWallets = {
  "0x0000000000000000000000000000000000000001": {
    source: "Demo Scam Dataset",
    category: "Fake Investment Scam",
    confidence: "High"
  },
  "0x0000000000000000000000000000000000000002": {
    source: "Demo Scam Dataset",
    category: "Phishing Wallet",
    confidence: "High"
  },
  "0x0000000000000000000000000000000000000003": {
    source: "Demo Scam Dataset",
    category: "Fake Support / Recovery Scam",
    confidence: "Medium"
  }
};

const highRiskWallets = {
  "0x0000000000000000000000000000000000000010": {
    category: "Mixer Exposure",
    source: "High-Risk Intelligence Dataset",
    confidence: "High"
  },
  "0x0000000000000000000000000000000000000020": {
    category: "Darknet Exposure",
    source: "High-Risk Intelligence Dataset",
    confidence: "High"
  },
  "0x0000000000000000000000000000000000000030": {
    category: "Ransomware Exposure",
    source: "High-Risk Intelligence Dataset",
    confidence: "High"
  },
  "0x0000000000000000000000000000000000000040": {
    category: "High-Risk Cluster",
    source: "High-Risk Intelligence Dataset",
    confidence: "Medium"
  }
};

async function getWalletActivity(walletAddress, network) {

  const explorerMap = {
    "Ethereum": "https://eth.blockscout.com",
    "Base": "https://base.blockscout.com",
    "Arbitrum": "https://arbitrum.blockscout.com",
    "Optimism": "https://optimism.blockscout.com",
    "Polygon": "https://polygon.blockscout.com"
  };
  async function checkChainabuseReports(walletAddress) {
  return {
    status: "Not connected",
    source: "Chainabuse",
    match: "API key required",
    category: "Not available",
    confidence: "Not available"
  };
}

  if (!explorerMap[network]) {
    return {
      status: "Explorer not connected",
      reputation: "Not available",
      ensDomain: "Not available",
      tokenActivity: "Not available",
      isContract: "Not available",
      isScam: "Not available",
      isVerified: "Not available",
      lastActivity: "Not available"
    };
  }

  try {

    const response = await fetch(
      `${explorerMap[network]}/api/v2/addresses/${walletAddress}`
    );

    if (!response.ok) {
      throw new Error("API response failed");
    }

    const data = await response.json();

    return {
      status: "Connected",

      reputation: data.reputation || "Unknown",

      ensDomain:
        data.ens_domain_name ||
        data.domain_name ||
        "None",

      tokenActivity:
        data.has_token_transfers
          ? "Token activity detected"
          : "No token transfers detected",

      isContract:
        data.is_contract ? "Yes" : "No",

      isScam:
        data.is_scam ? "Yes" : "No",

      isVerified:
        data.is_verified ? "Yes" : "No",

      lastActivity:
        data.block_number_balance_updated_at
          ? `Balance updated at block ${data.block_number_balance_updated_at}`
          : "Unknown"
    };

  } catch (error) {

    return {
      status: "Unable to retrieve wallet activity",
      reputation: "API error",
      ensDomain: "API error",
      tokenActivity: "API error",
      isContract: "API error",
      isScam: "API error",
      isVerified: "API error",
      lastActivity: "API error"
    };

  }
}

function cleanText(value) {
  return String(value)
    .replace(/<br>/g, "\n")
    .replace(/<strong>/g, "")
    .replace(/<\/strong>/g, "")
    .trim();
}

function getSafetyVerdict(score) {
  if (score >= 81) {
    return {
      title: "DO NOT SEND",
      level: "Critical Risk",
      message: "Critical risk indicators were detected. Do not proceed unless independently verified."
    };
  }

  if (score >= 51) {
    return {
      title: "HIGH RISK — VERIFY FIRST",
      level: "High Risk",
      message: "Strong risk indicators were detected. Verify the recipient before sending funds."
    };
  }

  if (score >= 21) {
    return {
      title: "PROCEED WITH CAUTION",
      level: "Medium Risk",
      message: "Some caution indicators were detected. Send a small test transaction first."
    };
  }

  return {
    title: "LOW RISK DETECTED",
    level: "Low Risk",
    message: "No major risk indicators were detected. Still verify recipient details before sending."
  };
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const walletAddress = document.getElementById("walletAddress").value.trim().toLowerCase();
  const network = document.getElementById("network").value;
  const amount = Number(document.getElementById("amount").value);

  const evmRegex = /^0x[a-fA-F0-9]{40}$/;
  const tronRegex = /^T[a-zA-Z0-9]{33}$/;
  const bitcoinRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;
  const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

  let isValidAddress = true;

  if (
    ["Ethereum", "BNB Chain", "Polygon", "Arbitrum", "Optimism", "Avalanche", "Base"].includes(network)
  ) {
    isValidAddress = evmRegex.test(walletAddress);
  }

  if (network === "Tron") {
    isValidAddress = tronRegex.test(walletAddress);
  }

  if (network === "Bitcoin") {
    isValidAddress = bitcoinRegex.test(walletAddress);
  }

  if (network === "Solana") {
    isValidAddress = solanaRegex.test(walletAddress);
  }

  if (!isValidAddress) {
    result.className = "result critical";
    result.innerHTML = `
      <div class="summary-card">
        <h2>INVALID WALLET ADDRESS</h2>
        <p class="score">Format Error</p>
        <p>The wallet address format does not match the selected network.</p>
      </div>
    `;
    latestScan = null;
    return;
  }

  let riskScore = 0;
  let riskFactors = [];
  let walletRisk = "No major wallet risk indicators detected";
  let complianceRisk = "No sanctions or regulatory match detected";
  let sanctionsStatus = "Checked";
  let sanctionsSource = "OFAC SDN Dataset";
  let sanctionsMatch = "No Match";
  let scamSignal = "No scam intelligence match detected";
  let transactionRisk = "Transaction amount appears normal";

  if (amount >= 10000) {
    riskScore += 25;
    transactionRisk = "Large transaction amount detected";
    riskFactors.push("Large transaction amount detected");
  }

  if (highRiskWallets[walletAddress]) {
    const info = highRiskWallets[walletAddress];

    riskScore += 60;
    riskFactors.push(`${info.category} detected`);

    walletRisk = `
      High-risk wallet exposure detected<br>
      <strong>Source:</strong> ${info.source}<br>
      <strong>Category:</strong> ${info.category}<br>
      <strong>Confidence:</strong> ${info.confidence}
    `;
  }

  if (scamWallets[walletAddress]) {
    const info = scamWallets[walletAddress];

    riskScore += 90;
    riskFactors.push(`${info.category} detected`);

    scamSignal = `
      Scam intelligence match detected<br>
      <strong>Source:</strong> ${info.source}<br>
      <strong>Category:</strong> ${info.category}<br>
      <strong>Confidence:</strong> ${info.confidence}
    `;
  }

  if (sanctionedWallets[walletAddress]) {
    const info = sanctionedWallets[walletAddress];

    riskScore = 100;
    sanctionsMatch = "MATCH DETECTED";
    riskFactors.push("OFAC sanctions match detected");

    complianceRisk = `
      OFAC sanctions match detected<br>
      <strong>Source:</strong> ${info.source}<br>
      <strong>Entity:</strong> ${info.entity}<br>
      <strong>Program:</strong> ${info.program}<br>
      <strong>Asset:</strong> ${info.asset}
    `;
  }

  if (riskScore > 100) {
    riskScore = 100;
  }

  const verdict = getSafetyVerdict(riskScore);

  let riskClass = "low";
  let confidence = "Low";
  let recommendedAction = "Proceed carefully and verify recipient details before sending funds.";

  if (riskScore >= 81) {
    riskClass = "critical";
    confidence = "High";
    recommendedAction = "Do not send. Verify the recipient through an independent trusted channel.";
  } else if (riskScore >= 51) {
    riskClass = "high";
    confidence = "High";
    recommendedAction = "Pause before sending. Verify the wallet and consider not proceeding.";
  } else if (riskScore >= 21) {
    riskClass = "medium";
    confidence = "Medium";
    recommendedAction = "Send a small test transaction first and verify recipient details.";
  }

  const checkTime = new Date().toLocaleString();
  const walletActivity = await getWalletActivity(walletAddress, network);
  const chainabuseData = await checkChainabuseReports(walletAddress);
  const networksToCheck = ["Ethereum", "Base", "Arbitrum", "Optimism", "Polygon"];

let activeNetworks = [];

for (const chain of networksToCheck) {
  const activity = await getWalletActivity(walletAddress, chain);

  const hasActivity =
    activity.tokenActivity === "Token activity detected" ||
    activity.lastActivity.includes("Balance updated");

  if (hasActivity) {
    activeNetworks.push(chain);
  }
}

let networkVerification = "Network activity could not be verified.";

if (activeNetworks.length === 0) {
  networkVerification = "No clear wallet activity detected across supported networks.";
} else if (activeNetworks.includes(network)) {
  networkVerification = `Activity detected on selected network: ${network}.`;
} else {
  networkVerification = `⚠ Possible wrong network. You selected ${network}, but activity was detected on: ${activeNetworks.join(", ")}.`;
  riskScore += 20;
  riskFactors.push("Possible wrong network selected");
}

  latestScan = {
    walletAddress,
    network,
    amount,
    chainabuseData,
    riskScore,
    riskLevel: verdict.level,
    safetyVerdict: verdict.title,
    verdictMessage: verdict.message,
    networkVerification,
    riskFactors,
    confidence,
    walletRisk,
    complianceRisk,
    scamSignal,
    transactionRisk,
    recommendedAction,
    checkTime,
    walletActivity
  };

  result.className = `result ${riskClass}`;

  result.innerHTML = `
    <div class="summary-card">
      <h2>${verdict.title}</h2>
      <p class="score">${riskScore}/100</p>
      <p><strong>Risk Level:</strong> ${verdict.level}</p>
      <p><strong>Confidence:</strong> ${confidence}</p>
      <p>${verdict.message}</p>
    </div>

    <div class="risk-meter">
      <div class="risk-fill" style="width: ${riskScore}%;"></div>
    </div>

    <div class="risk-labels">
      <span>Low</span>
      <span>Medium</span>
      <span>High</span>
      <span>Critical</span>
    </div>

    <div class="risk-grid">
      <div class="risk-box">
        <h3>Why This Result?</h3>
        <p>
          ${
            riskFactors.length > 0
              ? riskFactors.map(factor => `✓ ${factor}`).join("<br>")
              : "No major risk factors detected"
          }
        </p>
      </div>

      <div class="risk-box">
        <h3>Network Verification</h3>
        <p>${networkVerification}</p>
      </div>

      <div class="risk-box">
        <h3>Wallet Intelligence</h3>
        <p><strong>Risk Status:</strong> ${walletRisk}</p>
        <p><strong>API Status:</strong> ${walletActivity.status}</p>
        <p><strong>Reputation:</strong> ${walletActivity.reputation}</p>
        <p><strong>ENS Domain:</strong> ${walletActivity.ensDomain}</p>
        <p><strong>Token Activity:</strong> ${walletActivity.tokenActivity}</p>
        <p><strong>Smart Contract:</strong> ${walletActivity.isContract}</p>
        <p><strong>Scam Flag:</strong> ${walletActivity.isScam}</p>
        <p><strong>Verified:</strong> ${walletActivity.isVerified}</p>
        <p><strong>Last Balance Update:</strong> ${walletActivity.lastActivity}</p>
      </div>

    <div class="risk-box">
      <h3>Sanctions Intelligence</h3>
      <p><strong>Status:</strong> ${sanctionsStatus}</p>
      <p><strong>Source:</strong> ${sanctionsSource}</p>
      <p><strong>Match:</strong> ${sanctionsMatch}</p>
      <hr style="margin:10px 0; border-color:#334155;">
      <p>${complianceRisk}</p>
    </div>

    <div class="risk-box">
  <h3>Scam Intelligence</h3>

  <p><strong>Status:</strong> ${chainabuseData.status}</p>

  <p><strong>Source:</strong> ${chainabuseData.source}</p>

  <p><strong>Match:</strong> ${chainabuseData.match}</p>

  <p><strong>Category:</strong> ${chainabuseData.category}</p>

  <p><strong>Confidence:</strong> ${chainabuseData.confidence}</p>

  <hr style="margin:10px 0; border-color:#334155;">

  <p>${scamSignal}</p>
</div>

      <div class="risk-box">
        <h3>Before You Send</h3>
        <p>☐ Verify recipient identity</p>
        <p>☐ Confirm wallet address through another trusted channel</p>
        <p>☐ Send a small test transaction first</p>
        <p>☐ Double-check the amount and network</p>
      </div>
    </div>

    <div class="action-card">
      <h3>Recommended Action</h3>
      <p>${recommendedAction}</p>
    </div>

    <div class="scan-card">
      <h3>Check Summary</h3>
      <p><strong>Wallet:</strong> ${walletAddress}</p>
      <p><strong>Network:</strong> ${network}</p>
      <p><strong>Amount:</strong> $${amount.toLocaleString()}</p>
      <p><strong>Check Time:</strong> ${checkTime}</p>
    </div>
  `;
});

generateReportButton.addEventListener("click", function () {
  if (!latestScan) {
    alert("Please run a safety check before generating a report.");
    return;
  }

  reportSection.classList.remove("hidden");

  reportOutput.textContent = `
PRE-SEND CRYPTO SAFETY REPORT

Wallet Address:
${latestScan.walletAddress}

Network:
${latestScan.network}

Transaction Amount:
$${latestScan.amount.toLocaleString()}

Safety Verdict:
${latestScan.safetyVerdict}

Risk Level:
${latestScan.riskLevel}

Risk Score:
${latestScan.riskScore}/100

Confidence:
${latestScan.confidence}

----------------------------------

NETWORK VERIFICATION

${latestScan.networkVerification}

----------------------------------

WHY THIS RESULT?

${
  latestScan.riskFactors.length > 0
    ? latestScan.riskFactors.map(factor => `✓ ${factor}`).join("\n")
    : "No major risk factors detected"
}

----------------------------------

WALLET INTELLIGENCE

API Status:
${latestScan.walletActivity.status}

Reputation:
${latestScan.walletActivity.reputation}

ENS Domain:
${latestScan.walletActivity.ensDomain}

Token Activity:
${latestScan.walletActivity.tokenActivity}

Smart Contract:
${latestScan.walletActivity.isContract}

Scam Flag:
${latestScan.walletActivity.isScam}

Verified:
${latestScan.walletActivity.isVerified}

Last Balance Update:
${latestScan.walletActivity.lastActivity}

----------------------------------

COMPLIANCE SIGNALS

${cleanText(latestScan.complianceRisk)}

----------------------------------

SCAM SIGNALS

${cleanText(latestScan.scamSignal)}

----------------------------------

BEFORE YOU SEND CHECKLIST

[ ] Verify recipient identity
[ ] Confirm wallet address through another trusted channel
[ ] Send a small test transaction first
[ ] Double-check the amount and network

----------------------------------

RECOMMENDED ACTION

${latestScan.recommendedAction}

Check Timestamp:
${latestScan.checkTime}
  `;
});

downloadPdfButton.addEventListener("click", function () {
  if (!latestScan || !reportOutput.textContent.trim()) {
    alert("Please generate the safety report first.");
    return;
  }

  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
    <html>
      <head>
        <title>Pre-Send Crypto Safety Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #111827;
            line-height: 1.6;
          }

          h1 {
            color: #0f172a;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 10px;
          }

          pre {
            white-space: pre-wrap;
            font-family: Arial, sans-serif;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <h1>Pre-Send Crypto Safety Report</h1>
        <pre>${reportOutput.textContent}</pre>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
});