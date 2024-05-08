export type PaginationPageName =
  | 'parts'
  | 'link-parts'
  | 'requests'
  | 'notifications';

/**
 * ページングに必要な履歴情報をセッションストレージに保存する
 * @param pageName ページ名
 * @param history 履歴情報
 * @returns
 */
export function saveHistoryToSession(
  pageName: PaginationPageName,
  history: string[]
) {
  sessionStorage.setItem(`pagination.${pageName}`, JSON.stringify(history));
  return;
}

/**
 * ページングに必要な追加情報をセッションストレージに保存する
 * @param pageName ページ名
 * @param additionalData ページングに必要な追加情報
 * @returns
 */
export function saveAdditionalDataToSession(
  pageName: PaginationPageName,
  additionalData: { [key: string]: string; }
) {
  sessionStorage.setItem(
    `pagination.${pageName}.additionalData`,
    JSON.stringify(additionalData)
  );
  return;
}

/**
 * ページングに必要な履歴情報をセッションストレージから取得する
 * @param pageName ページ名
 * @returns 履歴情報
 */
export function loadHistoryFromSession(pageName: PaginationPageName): string[] {
  // データ存在チェック
  const item = sessionStorage.getItem(`pagination.${pageName}`);
  if (item === null) return [];

  // 型チェック
  const history = JSON.parse(item);
  if (
    !Array.isArray(history) ||
    !history.every((next: any) => typeof next === 'string')
  ) {
    return [];
  }
  return history;
}

/**
 * ページングに必要な追加情報をセッションストレージから取得する
 * @param pageName ページ名
 * @returns 追加情報
 */
export function loadAdditionalDataFromSession(pageName: PaginationPageName): {
  [key: string]: string;
} {
  // データ存在チェック
  const item = sessionStorage.getItem(`pagination.${pageName}.additionalData`);
  if (item === null) return {};
  else return JSON.parse(item);
}
