const form = document.getElementById("riskForm");
const result = document.getElementById("result");
const scanHistory = document.getElementById("scanHistory");

let historyItems = [];
let latestScan = null;
let caseCounter = 1;

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
  if (network !== "Ethereum") {
    return {
      status: "API currently connected for Ethereum only",
      reputation: "Not connected",
      ensDomain: "Not connected",
      transactionCount: "Not connected",
      isContract: "Not connected",
      isScam: "Not connected",
      isVerified: "Not connected",
      lastActivity: "Not connected"
    };
  }

  try {
    const response = await fetch(
      `https://eth.blockscout.com/api/v2/addresses/${walletAddress}`
    );

    if (!response.ok) {
      throw new Error("API response failed");
    }

    const data = await response.json();

    return {
      status: "Active",
      reputation: data.reputation || "Unknown",
      ensDomain: data.ens_domain_name || "None",
      transactionCount: data.has_token_transfers ? "Token activity detected" : "No token transfers detected",
      isContract: data.is_contract ? "Yes" : "No",
      isScam: data.is_scam ? "Yes" : "No",
      isVerified: data.is_verified ? "Yes" : "No",
      lastActivity: data.block_number_balance_updated_at
        ? `Balance updated at block ${data.block_number_balance_updated_at}`
        : "Unknown"
    };
  } catch (error) {
    return {
      status: "Unable to retrieve wallet activity",
      reputation: "API error",
      ensDomain: "API error",
      transactionCount: "API error",
      isContract: "API error",
      isScam: "API error",
      isVerified: "API error",
      lastActivity: "API error"
    };
  }
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
    latestScan = {caseId: `CASE-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(caseCounter++).padStart(3,'0')}`,
      walletAddress,
      network,
      amount, 
      riskScore, 
      riskLevel, 
      confidence, 
      walletRisk, 
      complianceRisk, 
      transactionRisk, 
      communityRisk, 
      action, 
      scanTime, 
      walletActivity
    };
    result.innerHTML = `
      <div class="summary-card">
        <h2>Invalid Wallet Address</h2>
        <p class="score">Format Error</p>
        <p><strong>Network:</strong> ${network}</p>
      </div>

      <div class="action-card">
        <h3>Recommended Action</h3>
        <p>The wallet address format does not match the selected network. Please check the address before proceeding.</p>
      </div>
    `;
    return;
  }

  let riskScore = 0;
  let walletRisk = "No major wallet risk indicators detected";
  let complianceRisk = "No sanctions or regulatory match detected";
  let transactionRisk = "Transaction amount appears normal";
  let communityRisk = "No privacy-focused community alerts detected";

  if (amount >= 10000) {
    riskScore += 25;
    transactionRisk = "Large transaction amount detected";
  }

  if (highRiskWallets[walletAddress]) {
    const highRiskInfo = highRiskWallets[walletAddress];

    riskScore += 60;

    walletRisk = `
      Linked to high-risk wallet exposure<br>
      <strong>Source:</strong> ${highRiskInfo.source}<br>
      <strong>Category:</strong> ${highRiskInfo.category}<br>
      <strong>Confidence:</strong> ${highRiskInfo.confidence}
    `;
  }

  if (scamWallets[walletAddress]) {
    const scamInfo = scamWallets[walletAddress];

    riskScore += 90;

    walletRisk = `
      Scam-reported wallet indicator<br>
      <strong>Source:</strong> ${scamInfo.source}<br>
      <strong>Category:</strong> ${scamInfo.category}<br>
      <strong>Confidence:</strong> ${scamInfo.confidence}
    `;

    communityRisk = "Aggregated scam category signal detected";
  }

  if (sanctionedWallets[walletAddress]) {
    const sanctionInfo = sanctionedWallets[walletAddress];

    riskScore = 100;

    complianceRisk = `
      OFAC Sanctions Match Detected<br>
      <strong>Source:</strong> ${sanctionInfo.source}<br>
      <strong>Entity:</strong> ${sanctionInfo.entity}<br>
      <strong>Program:</strong> ${sanctionInfo.program}<br>
      <strong>Asset:</strong> ${sanctionInfo.asset}
    `;

    walletRisk = "Sanctioned digital asset address";
    communityRisk = "Regulatory alert triggered";
  }

  if (riskScore > 100) {
    riskScore = 100;
  }

  let riskLevel = "Low Risk";
  let riskClass = "low";
  let confidence = "Low";
  let action = "Proceed carefully and verify recipient details before sending funds.";

  if (riskScore >= 81) {
    riskLevel = "Critical Risk";
    riskClass = "critical";
    confidence = "High";
    action = "Do not proceed until the recipient is independently verified.";
  } else if (riskScore >= 51) {
    riskLevel = "High Risk";
    riskClass = "high";
    confidence = "High";
    action = "Verify recipient independently before proceeding.";
  } else if (riskScore >= 21) {
    riskLevel = "Medium Risk";
    riskClass = "medium";
    confidence = "Medium";
    action = "Send a small test transaction first and verify recipient details.";
  }

  const scanTime = new Date().toLocaleString();
  const walletActivity = await getWalletActivity(walletAddress, network);
  latestScan = {
     caseId: `CASE-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(caseCounter++).padStart(3,'0')}`,
     walletAddress,
     network,
     amount,
     riskScore,
     riskLevel,
     confidence,
     walletRisk,
     complianceRisk,
     transactionRisk,
     communityRisk,
     action,
     scanTime,
     walletActivity
    };

  result.className = `result ${riskClass}`;

  result.innerHTML = `
    <div class="summary-card">
      <h2>${riskLevel}</h2>
      <p class="score">${riskScore}/100</p>
      <p><strong>Confidence:</strong> ${confidence}</p>
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
        <h3>Wallet Risk Intelligence</h3>
        <p><strong>Risk Status:</strong> ${walletRisk}</p>
        <p><strong>API Status:</strong> ${walletActivity.status}</p>
        <p><strong>Reputation:</strong> ${walletActivity.reputation}</p>
        <p><strong>ENS Domain:</strong> ${walletActivity.ensDomain}</p>
        <p><strong>Token Activity:</strong> ${walletActivity.transactionCount}</p>
        <p><strong>Smart Contract:</strong> ${walletActivity.isContract}</p>
        <p><strong>Scam Flag:</strong> ${walletActivity.isScam}</p>
        <p><strong>Verified:</strong> ${walletActivity.isVerified}</p>
        <p><strong>Last Balance Update:</strong> ${walletActivity.lastActivity}</p>
      </div>

      <div class="risk-box">
        <h3>Compliance & Regulatory Risk</h3>
        <p>${complianceRisk}</p>
      </div>

      <div class="risk-box">
        <h3>Transaction Behavior Protection</h3>
        <p>${transactionRisk}</p>
      </div>

      <div class="risk-box">
        <h3>Community Intelligence</h3>
        <p>${communityRisk}</p>
      </div>
    </div>

    <div class="action-card">
      <h3>Recommended Action</h3>
      <p>${action}</p>
    </div>

    <div class="scan-card">
      <h3>Scan Summary</h3>
      <p><strong>Wallet:</strong> ${walletAddress}</p>
      <p><strong>Network:</strong> ${network}</p>
      <p><strong>Amount:</strong> $${amount.toLocaleString()}</p>
      <p><strong>Scan Time:</strong> ${scanTime}</p>
    </div>
  `;

  historyItems.unshift({
    wallet: walletAddress,
    network: network,
    risk: riskLevel,
    score: riskScore
  });

  historyItems = historyItems.slice(0, 5);

  scanHistory.innerHTML = historyItems
    .map(item => `
      <div class="history-item">
        <span>${item.network}</span>
        <strong>${item.risk}</strong>
        <small>${item.score}/100</small>
      </div>
    `)
    .join("");
});
const generateReportButton = document.getElementById("generateReport");
const reportSection = document.getElementById("reportSection");
const reportOutput = document.getElementById("reportOutput");

generateReportButton.addEventListener("click", function () {
  if (!latestScan) {
    alert("Please run a safety check before generating a report.");
    return;
  }

  reportSection.classList.remove("hidden");

  reportOutput.textContent = `
PRE-SEND CRYPTO SAFETY CHECK REPORT
Case ID:
${latestScan.caseId}

Wallet Address:
${latestScan.walletAddress}

Network:
${latestScan.network}

Transaction Amount:
$${latestScan.amount.toLocaleString()}

Risk Score:
${latestScan.riskScore}/100

Risk Level:
${latestScan.riskLevel}

Confidence Level:
${latestScan.confidence}

----------------------------------

BLOCKCHAIN INTELLIGENCE

API Status:
${latestScan.walletActivity.status}

Reputation:
${latestScan.walletActivity.reputation}

ENS Domain:
${latestScan.walletActivity.ensDomain}

Token Activity:
${latestScan.walletActivity.transactionCount}

Smart Contract:
${latestScan.walletActivity.isContract}

Scam Flag:
${latestScan.walletActivity.isScam}

Verified:
${latestScan.walletActivity.isVerified}

Last Balance Update:
${latestScan.walletActivity.lastActivity}

----------------------------------

WALLET RISK INTELLIGENCE

${latestScan.walletRisk.replace(/<br>/g, "\n").replace(/<strong>/g, "").replace(/<\/strong>/g, "")}

----------------------------------

COMPLIANCE & REGULATORY RISK

${latestScan.complianceRisk.replace(/<br>/g, "\n").replace(/<strong>/g, "").replace(/<\/strong>/g, "")}

----------------------------------

TRANSACTION BEHAVIOR PROTECTION

${latestScan.transactionRisk}

----------------------------------

COMMUNITY INTELLIGENCE

${latestScan.communityRisk}

----------------------------------

RECOMMENDED ACTION

${latestScan.action}

Scan Timestamp:
${latestScan.scanTime}
  `;
});

const downloadBtn = document.getElementById("downloadReport");

downloadBtn.addEventListener("click", () => {

  if (!latestScan) return;

  const text = reportOutput.textContent;

  const blob = new Blob([text], {
    type: "text/plain"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = `${latestScan.caseId}.txt`;

  a.click();

  URL.revokeObjectURL(url);

});
const downloadPdfButton = document.getElementById("downloadPdf");

downloadPdfButton.addEventListener("click", function () {
  if (!latestScan) {
    alert("Please run a safety check and generate a report first.");
    return;
  }

  if (!reportOutput.textContent.trim()) {
    alert("Please generate the investigation report first.");
    return;
  }

  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
    <html>
      <head>
        <title>${latestScan.caseId || "Pre-Send Crypto Safety Report"}</title>
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
        <h1>Pre-Send Crypto Safety Check Report</h1>
        <pre>${reportOutput.textContent}</pre>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
});
