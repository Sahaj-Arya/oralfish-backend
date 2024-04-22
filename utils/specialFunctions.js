function checkClickIdExists(leadSettlementData, providedClickId) {
  for (let i = 0; i < leadSettlementData?.length; i++) {
    if (leadSettlementData[i]?.click_id === providedClickId) {
      return true; // Click ID exists
    }
  }
  return false; // Click ID does not exist
}

module.exports = { checkClickIdExists };
