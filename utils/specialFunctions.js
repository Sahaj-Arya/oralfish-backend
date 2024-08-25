const crypto = require("crypto");
function checkClickIdExists(leadSettlementData, providedClickId) {
  for (let i = 0; i < leadSettlementData?.length; i++) {
    if (leadSettlementData[i]?.click_id === providedClickId) {
      return true; // Click ID exists
    }
  }
  return false; // Click ID does not exist
}

function generateOrderId() {
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of the current timestamp
  const uniquePart = crypto.randomInt(100, 999); // Generate a random 3-digit number
  return `${timestamp}${uniquePart}`;
}

module.exports = { checkClickIdExists, generateOrderId };
