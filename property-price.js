window.AntaraTotalPrice = (rate, area, rateUnit, areaUnit) => {
  if (String(rate).trim()==='' || String(area).trim()==='') return null;
  const r=Number(rate), a=Number(area);
  if (!Number.isFinite(r)||!Number.isFinite(a)||r<0||a<0) return null;
  const units={'sq.ft':0.09290304,'sq.m':1,acre:4046.8564224,hectare:10000};
  if (rateUnit || areaUnit) {
    if (!units[rateUnit] || !units[areaUnit]) return null;
    area=a*units[areaUnit]/units[rateUnit];
  } else area=a;
  const total=r*area;
  return Number.isFinite(total)?Math.round((total+Number.EPSILON)*100)/100:null;
};
