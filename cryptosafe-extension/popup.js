const scamWallets = [
  "0x0000000000000000000000000000000000000001"
];

const sanctionedWallets = [
  "0x72a5843cc08275c8171e582972aa4fda8c397b2a"
];

const networkTestWallets = {
  "0x1111111111111111111111111111111111111111": "Ethereum"
};

const checkButton = document.getElementById("checkButton");
const result = document.getElementById("result");

checkButton.addEventListener("click", () => {

  const wallet = document
    .getElementById("walletAddress")
    .value
    .trim()
    .toLowerCase();

  const network = document
    .getElementById("network")
    .value;

  const detectedNetwork =
    networkTestWallets[wallet];

  if (
    detectedNetwork &&
    detectedNetwork !== network
  ) {

    result.innerHTML = `
      <div class="verdict warning">
        <h2>⚠ WRONG NETWORK</h2>
        <p>${network} selected</p>
        <p>${detectedNetwork} detected</p>
      </div>
    `;

    return;
  }

  if (sanctionedWallets.includes(wallet)) {

    result.innerHTML = `
      <div class="verdict blocked">
        <h2>🚫 BLOCKED</h2>
        <p>Sanctions match detected</p>
      </div>
    `;

    return;
  }

  if (scamWallets.includes(wallet)) {

    result.innerHTML = `
      <div class="verdict scam">
        <h2>🔴 SCAM WARNING</h2>
        <p>Fraud reports detected</p>
      </div>
    `;

    return;
  }

  result.innerHTML = `
    <div class="verdict safe">
      <h2>🟢 SAFE</h2>
      <p>No known scam reports detected</p>
    </div>
  `;

});