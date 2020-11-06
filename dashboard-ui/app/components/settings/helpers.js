export const statuses = ['paid', 'late', 'draft', 'sent'];
export const pillColors = {
  draft: '#a9a9a9',
  sent: '#a86bf7',
  late: '#f47a76',
  paid: '#83cf51'
};
export const toMoney = (n, _c, _d, _t) => {
  let c = isNaN(_c = Math.abs(_c)) ? 2 : _c;

  let d = _d === undefined ? '.' : _d;

  let t = _t === undefined ? ',' : _t;

  let s = n < 0 ? '-' : '';

  let i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c)));

  let j = i.length > 3 ? i.length % 3 : 0;
  return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
};

export const toUSD = (number) => `$${toMoney(number / 100)}`;
