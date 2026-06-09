const networkTestWallets = {
  "0x1111111111111111111111111111111111111111": "Ethereum",
  "0x2222222222222222222222222222222222222222": "Polygon",
  "0x3333333333333333333333333333333333333333": "Base"
};

const sanctionedWallets = [
  "0x72a5843cc08275c8171e582972aa4fda8c397b2a"
];

const scamWallets = [
  "0x0000000000000000000000000000000000000001"
];

const form = document.getElementById("riskForm");
const result = document.getElementById("result");

form.addEventListener("submit", function(event) {

  event.preventDefault();

  const wallet = document
    .getElementById("walletAddress")
    .value
    .trim()
    .toLowerCase();

  const network = document
    .getElementById("network")
    .value;

  const detectedNetwork = networkTestWallets[wallet];

  // WRONG NETWORK

  if (
    detectedNetwork &&
    detectedNetwork !== network
  ) {

    result.innerHTML = `
      <div class="verdict warning">
        <h2>⚠ WRONG NETWORK</h2>

        <p>
          Selected Network:
          <strong>${network}</strong>
        </p>

        <p>
          Detected Network:
          <strong>${detectedNetwork}</strong>
        </p>

        <p>
          Please confirm the recipient's network before sending funds.
        </p>
      </div>
    `;

    return;
  }

  // SANCTIONS

  if (sanctionedWallets.includes(wallet)) {

    result.innerHTML = `
      <div class="verdict blocked">
        <h2>🚫 BLOCKED</h2>

        <p>
          This wallet appears on sanctions lists.
        </p>

        <p>
          Do not proceed.
        </p>
      </div>
    `;

    return;
  }

  // SCAM

  if (scamWallets.includes(wallet)) {

    result.innerHTML = `
      <div class="verdict scam">
        <h2>🔴 SCAM WARNING</h2>

        <p>
          Fraud reports detected for this wallet.
        </p>

        <p>
          Do not send funds.
        </p>
      </div>
    `;

    return;
  }

  // SAFE

  result.innerHTML = `
    <div class="verdict safe">

      <h2>🟢 SAFE TO SEND</h2>

      <p>
        No known scam reports detected.
      </p>

      <p>
        Network: ${network}
      </p>

    </div>
  `;

});