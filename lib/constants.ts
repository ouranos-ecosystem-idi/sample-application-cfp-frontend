// 追加できる構成部品の最大数
export const MAX_CHILD_PARTS_NUM = 50;

// 証明書：コメント最大文字数
export const MAX_CERT_COMMENT_NUM = 100;
// 証明書：アップロード可能な合計ファイルサイズ
export const UPLOAD_MAX_CERT_FILESIZE = 100 * 1024 * 1024; // 100MB
// 証明書：アップロード可能な合計ファイル数
export const UPLOAD_MAX_CERT_FILE_NUM = 100;
// 証明書：アップロード可能なファイル名の文字数
export const UPLOAD_MAX_CERT_FILE_NAME_NUM = 100;
// 証明書：アップロード可能な拡張子
export const ACCEPTED_UPLOAD_CERT_FILE_EXT = [
  '.txt',
  '.csv',
  '.pdf',
  '.doc',
  '.docx',
  '.odt',
  '.ppt',
  '.pptx',
  '.odp',
  '.xls',
  '.xlsx',
  '.ods',
  '.jpeg',
  '.jpg',
  '.bmp',
  '.gif',
  '.png',
  '.zip',
];

// 親部品一覧（部品構成一覧・部品紐付け画面）で表示する部品数
export const PARTS_NUM = 100;

export const sheetCsvHeaders = [
  '部品項目',
  '補助項目',
  '事業所名',
  '事業所識別子',
  'トレース識別子',
  'CFP合計',
  '原材料取得および前処理CFP合計',
  '前処理自社由来排出量',
  '前処理部品由来排出量',
  '主な製造CFP合計',
  '製造自社由来排出量',
  '製造部品由来排出量',
  '単位',
  '原材料取得および前処理DQR合計',
  '前処理TeR',
  '前処理TiR',
  '前処理GeR',
  '主な製造DQR合計',
  '製造TeR',
  '製造TiR',
  '製造GeR',
];

// テーブル情報のCSVヘッダー
export const tableCsvHeaders = [
  'レベル',
  '終端フラグ',
  '部品項目',
  '補助項目',
  '事業所名',
  '事業所識別子',
  'トレース識別子',
  '活動量',
  '活動量単位',
  '依頼ステータス',
  '事業者名',
  '事業者識別子',
  '原材料取得および前処理CFP',
  '主な製造CFP',
  '単位',
  '前処理TeR',
  '前処理TiR',
  '前処理GeR',
  '製造TeR',
  '製造TiR',
  '製造GeR',
];
