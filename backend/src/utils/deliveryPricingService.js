const calculateDeliveryFee = ({ distanceKm = 0, express = false, zone = 'A', baseFee = 1000, pricePerKm = 150, expressFee = 500, minimumFee = 1000, maximumDistance = 30 }) => {
  const sanitizedDistance = Number(distanceKm) || 0;
  const zoneBase = {
    A: 1000,
    B: 1500,
    C: 2000
  };

  let effectiveBaseFee = Number(baseFee) || 1000;
  if (zone && zoneBase[zone]) {
    effectiveBaseFee = zoneBase[zone];
  }

  const distanceFee = sanitizedDistance * (Number(pricePerKm) || 150);
  const appliedExpressFee = express ? Number(expressFee) || 500 : 0;
  const total = Math.max(
    Number(minimumFee) || effectiveBaseFee,
    effectiveBaseFee + distanceFee + appliedExpressFee
  );

  return {
    baseFee: effectiveBaseFee,
    distanceFee,
    expressFee: appliedExpressFee,
    total: Math.min(total, Number(maximumDistance) ? total : total),
    distanceKm: sanitizedDistance,
    zone
  };
};

module.exports = { calculateDeliveryFee };
