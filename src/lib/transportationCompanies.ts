export const RAILWAY_COMPANIES = [
  'JR東日本', 'JR東海', 'JR西日本', 'JR北海道', 'JR四国', 'JR九州',
  '東京メトロ', '都営地下鉄', '京王電鉄', '小田急電鉄', '東急電鉄', '京急電鉄',
  '西武鉄道', '東武鉄道', '近畿日本鉄道', '阪急電鉄', '阪神電気鉄道', '南海電気鉄道',
  '名古屋鉄道', '西日本鉄道', '札幌市交通局'
];

export const BUS_COMPANIES = [
  '東急バス', '京王バス', '小田急バス', '西武バス', '東武バス', '京成バス', '京浜急行バス',
  '神奈川中央交通', '横浜市営バス', '川崎市営バス', '千葉中央バス', 'ちばシティバス',
  '大阪シティバス', '京都市営バス', '阪急バス', '阪神バス', '近鉄バス', '南海バス', '神戸市営バス',
  '名古屋市営バス', '名鉄バス', '三重交通', '西鉄バス', '福岡市営バス', '長崎バス',
  '札幌市営バス', 'じょうてつバス', '仙台市営バス', '広島電鉄', '岡山電気軌道'
];

export function guessCompanyFromLine(line: string) {
  if (!line) return '';
  if (line.includes('JR')) {
    if (line.includes('東海道') || line.includes('中央')) return 'JR東海';
    if (line.includes('東北') || line.includes('山手') || line.includes('埼京')) return 'JR東日本';
    if (line.includes('西日本') || line.includes('山陽')) return 'JR西日本';
    return 'JR';
  }
  if (line.includes('東京メトロ')) return '東京メトロ';
  if (line.includes('京王')) return '京王電鉄';
  if (line.includes('小田急')) return '小田急電鉄';
  return '';
}
