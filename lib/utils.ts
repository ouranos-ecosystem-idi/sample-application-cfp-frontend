import { StatusBadgeColors } from '@/components/atoms/StatusBadge';
import {
  AmountRequiredUnit,
  CfpResponseStatusType,
  CfpUnits,
  DqrSheetDataType,
  DqrSheetValueType,
  DqrValueType,
  NotificationTypes,
  Parts,
  PartsStructure,
  Plant,
  TradeRequestDataTypeWithOperator,
  TradeRequestStatusType,
  TradeResponseStatusType,
  TradeStatus,
} from '@/lib/types';

import Decimal from 'decimal.js';
import { FormikErrors, FormikTouched, getIn } from 'formik';

export type CalculatedCfp = {
  cfpPreEmissionsOfOwnComponent?: number;
  cfpPreEmissionsOfChildComponent?: number;
  mainProductionEmissionsOfOwnComponent?: number;
  mainProductionEmissionsOfChildComponent?: number;
};

/**
 * 引数に与えられた加算対象を加算した結果を返却する。1つでもundefinedが含まれていた場合undefinedを返す。
 * @param value 加算対象の配列
 * @returns 計算結果
 */
export function sumDenyUndefined(
  ...value: (number | undefined)[]
): number | undefined {
  if (value.includes(undefined)) {
    return undefined;
  }
  return sum(...value);
}

/**
 * 引数に与えられた加算対象を加算した結果を返却する。undefinedは0として扱う。
 * @param value 加算対象の配列
 * @returns 計算結果
 */
export function sum(...value: (number | undefined)[]): number {
  const filteredValue = value.filter((v) => v !== undefined) as number[];
  return filteredValue.reduce(
    (s: number, v: number) => Decimal.add(s, v).toNumber(),
    0
  );
}

/**
 * 原材料取得及び前処理排出量と主な製造排出量に、活動量を掛けた結果をすべて加算して返却する。
 * @param targets 排出量と活動量を含む配列
 * @returns 計算結果
 */
export function calcCfpSum(
  targets: {
    amountRequired: number;
    preEmission?: number;
    mainEmission?: number;
  }[]
): { preEmission: number; mainEmission: number; } {
  const emissionAmount = targets.map(
    ({ amountRequired, preEmission, mainEmission }) => {
      return [
        Decimal.mul(amountRequired, preEmission ?? 0).toNumber(),
        Decimal.mul(amountRequired, mainEmission ?? 0).toNumber(),
      ];
    }
  );
  return {
    preEmission: sum(...emissionAmount.map(([pre, _]) => pre)),
    mainEmission: sum(...emissionAmount.map(([_, main]) => main)),
  };
}

/**
 * DQRの平均値を算出する。
 * @param targets 子部品の排出量、DQR、活動量を含む配列
 * @param parent 親部品の排出量とDQR
 * @returns 計算結果
 */
export function calcDqrValue(
  targets: { dqrValue: number; amountRequired: number; emission: number; }[],
  parent: {
    emission: number;
    dqrValue: number;
  }
): string {
  const cfpList = [
    ...targets.map((target) => new Decimal(target.emission).mul(target.amountRequired).toNumber()),
    parent.emission,
  ];
  const cfpSum = cfpList.reduce((sum, dqrValue) => (new Decimal(sum).add(dqrValue).toNumber()), 0);
  if (cfpSum === 0) return '0';

  const dqrValueList = [
    ...targets.map(({ dqrValue, amountRequired, emission }) =>
      new Decimal(dqrValue).mul(amountRequired).mul(emission).toNumber()
    ),
    new Decimal(parent.dqrValue).mul(parent.emission).toNumber(),
  ];

  return formatNumber(
    new Decimal(dqrValueList.reduce((sum, dqrValue) => (new Decimal(sum).add(dqrValue).toNumber()), 0))
      .div(cfpSum)
      .toNumber()
    , 5
  );
}

/**
 * 構成部品の各TeR、TiR、GeRの平均値と合算値を算出する。
 * @param targets 子部品の排出量、DQR、活動量を含む配列
 * @param parent 親部品の排出量とDQR
 * @returns 計算結果
 */
export function calcDqrValues(
  targets: Array<
    {
      amountRequired: number;
      emission: number;
    } & DqrValueType
  >,
  parent: DqrValueType & {
    emission: number;
  }
): DqrSheetValueType {
  const TeR = calcDqrValue(
    targets.map(({ TeR, amountRequired, emission }) => ({
      dqrValue: TeR ?? 0,
      amountRequired: amountRequired,
      emission: emission,
    })),
    { emission: parent.emission, dqrValue: parent.TeR ?? 0 }
  );

  const TiR = calcDqrValue(
    targets.map(({ TiR, amountRequired, emission }) => ({
      dqrValue: TiR ?? 0,
      amountRequired: amountRequired,
      emission: emission,
    })),
    { emission: parent.emission, dqrValue: parent.TiR ?? 0 }
  );

  const GeR = calcDqrValue(
    targets.map(({ GeR, amountRequired, emission }) => ({
      dqrValue: GeR ?? 0,
      amountRequired: amountRequired,
      emission: emission,
    })),
    { emission: parent.emission, dqrValue: parent.GeR ?? 0 }
  );

  const dqr = formatNumber(
    new Decimal(TeR).plus(GeR).plus(TiR).div(3).toNumber(), 5
  );

  return {
    TeR,
    TiR,
    GeR,
    dqr,
  };
}

/**
 * 原材料取得及び前処理排出量 および 主な製造排出量のそれぞれの排出量とDQRの合計値を算出する。
 * @param targets 子部品の排出量、DQR、活動量を含む配列
 * @param parent 親部品の排出量とDQR
 * @returns 計算結果
 */
export function calcDqrSum(
  targets: {
    amountRequired: number;
    preEmission?: number;
    mainEmission?: number;
    preTeR?: number;
    preTiR?: number;
    preGeR?: number;
    mainTeR?: number;
    mainTiR?: number;
    mainGeR?: number;
  }[],
  parent: {
    preEmission?: number;
    mainEmission?: number;
    preTeR?: number;
    preTiR?: number;
    preGeR?: number;
    mainTeR?: number;
    mainTiR?: number;
    mainGeR?: number;
  }
): DqrSheetDataType {
  // 原材料のDQR値
  const preDqrValues = calcDqrValues(
    targets.map(({ amountRequired, preEmission, preTeR, preGeR, preTiR }) => ({
      amountRequired: amountRequired,
      emission: preEmission ?? 0,
      TeR: preTeR ?? 0,
      TiR: preTiR ?? 0,
      GeR: preGeR ?? 0,
    })),
    {
      emission: parent.preEmission ?? 0,
      TeR: parent.preTeR ?? 0,
      TiR: parent.preTiR ?? 0,
      GeR: parent.preGeR ?? 0,
    }
  );
  // 主な製造のDQR値
  const mainDqrValues = calcDqrValues(
    targets.map(
      ({ amountRequired, mainEmission, mainTeR, mainGeR, mainTiR }) => ({
        amountRequired: amountRequired,
        emission: mainEmission ?? 0,
        TeR: mainTeR ?? 0,
        TiR: mainTiR ?? 0,
        GeR: mainGeR ?? 0,
      })
    ),
    {
      emission: parent.mainEmission ?? 0,
      TeR: parent.mainTeR ?? 0,
      TiR: parent.mainTiR ?? 0,
      GeR: parent.mainGeR ?? 0,
    }
  );

  return {
    preEmission: preDqrValues,
    mainEmission: mainDqrValues,
  };
}

/**
 * tradeRequestのステータスタイプからステータス名を返却する。
 * @param status ステータスタイプ
 * @returns ステータス名
 */
export function getTradeRequestStatusName(status: TradeRequestStatusType) {
  const map: {
    [Key in TradeRequestStatusType]: string;
  } = {
    incomplete: '依頼未完了',
    'registering-parts': '部品登録中',
    'registering-cfp': 'CFP登録中',
    received: '回答受領済',
    remanded: '差戻し',
    canceled: '取消',
  };
  return map[status];
}

/**
 * tradeRequestのステータスタイプから、ステータスの色を返却する。
 * @param status ステータスタイプ
 * @returns ステータスの色
 */
export function getTradeRequestStatusColor(status: TradeRequestStatusType) {
  const map: {
    [Key in TradeRequestStatusType]: StatusBadgeColors;
  } = {
    incomplete: 'yellow',
    'registering-parts': 'blue',
    'registering-cfp': 'blue',
    received: 'gray',
    remanded: 'red',
    canceled: 'gray',
  };
  return map[status];
}

/**
 * 依頼状況のラベルと色の組み合わせを定義する。
 */
export const tradeResponseStatusAttributes: {
  readonly [T in TradeResponseStatusType]: {
    readonly badgeColor: StatusBadgeColors;
    readonly label: string;
  };
} = {
  incomplete: { badgeColor: 'yellow', label: '回答未完了' },
  sent: { badgeColor: 'gray', label: '回答送信済' },
  remanded: { badgeColor: 'red', label: '差戻し' },
};

/**
 * 依頼を未送信・送信済で分類する。
 * @param tradeRequestData tradeRequestデータの配列
 * @returns 未送信・送信済で分類された配列を含むオブジェクト
 */
export function separateTradeRequestDataByRequestedStatus(
  tradeRequestData: TradeRequestDataTypeWithOperator[]
) {
  let result: {
    requestedData: TradeRequestDataTypeWithOperator[];
    notRequestedData: TradeRequestDataTypeWithOperator[];
  } = {
    requestedData: [],
    notRequestedData: [],
  };
  tradeRequestData.forEach((data) => {

    // 親部品もしくは終端フラグ部品の場合依頼対象でない部品のため除外する
    if (data.downStreamPart.level === 1 || data.downStreamPart.terminatedFlag) return;

    if (
      ['incomplete', 'canceled', 'remanded'].includes(getRequestStatus(data?.tradeStatus?.requestStatus))
    ) {
      result.notRequestedData.push(data);
    } else {
      result.requestedData.push(data);
    }
  });
  return result;
}

/**
 * CFPの回答状況から、依頼ステータスを返却する。
 * @param requestStatus CFPの回答状況
 * @returns 依頼ステータス
 */
export function getRequestStatus(requestStatus?: TradeStatus['requestStatus']): TradeRequestStatusType {
  // 蓄電池トレーサビリティーシステムでは下記が返却されます。（2023/11 公開時点）

  // cfpResponseStatus: CFPの回答状況を表します。ステータスの種類と意味合いは以下です（変更の可能性あり）
  // NOT_COMPLETED → 依頼中
  // COMPLETED → 回答完了
  // REJECT → 差戻
  // CANCEL → 取消

  // tradeTreeStatus: 対象の取引関係情報が全て終端したかを表します。ステータスの種類と意味合いは以下です（変更の可能性あり）
  // TERMINATED → 終端済み
  // UNTERMINATED → 未終端

  switch (requestStatus?.cfpResponseStatus) {
    case 'NOT_COMPLETED':
      if (requestStatus.tradeTreeStatus === 'TERMINATED')
        return 'registering-cfp';
      else
        return 'registering-parts';
    case 'COMPLETED':
      return 'received';
    case 'REJECT':
      return 'remanded';
    case 'CANCEL':
      return 'canceled';
  }
  return 'incomplete';
}

/**
 * CFPの回答状況から、回答ステータスを返却する。
 * @param cfpResponseStatus CFPの回答状況
 * @returns 回答ステータス
 */
export function getResponseStatus(cfpResponseStatus: CfpResponseStatusType): TradeResponseStatusType {
  // cfpResponseStatus: CFPの回答状況を表します。ステータスの種類と意味合いは以下です（変更の可能性あり）
  // NOT_COMPLETED → 依頼中
  // COMPLETED → 回答完了
  // REJECT → 差戻
  // CANCEL → 取消

  switch (cfpResponseStatus) {
    case 'COMPLETED':
      return 'sent';
    case 'REJECT':
      return 'remanded';
  }
  return 'incomplete';
}

/**
 * 値がundefined, null, または空文字を判定する。
 * @param value 判定する値
 * @returns 判定結果の真偽値
 */
export function isEmpty(value: any) {
  return value === undefined || value === null || value === '';
}

/**
 * URLのサニタイズを行う。
 * @param value URL文字列
 * @returns URLのサニタイズ後文字列（不正な場合undefined)
 */
export function sanitizeUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch (_) {
    return undefined;
  }
  return url.protocol === 'http:' || url.protocol === 'https:'
    ? url.toString()
    : undefined;
}

/**
 * 指定された小数点から切り上げる。
 * @param num 切り上げ対象の値
 * @param roundUpNum 切り上げる小数点の位置
 * @returns 計算結果
 */
export function roundUpDecimalPlace(num: number, roundUpNum?: number): number {
  return new Decimal(num).toDecimalPlaces(roundUpNum ?? 1, Decimal.ROUND_UP).toNumber();
}

/**
 * 通知タイプから通知タイプ名を返却する。
 * @param notificationType 通知タイプ
 * @returns 通知タイプ名
 */
export function getNotificationTypeName(notificationType: NotificationTypes) {
  const map: {
    [Key in NotificationTypes]: string;
  } = {
    REQUEST_NEW: '依頼登録',
    REQUEST_CANCELED: '依頼取消',
    REQUEST_REJECTED: '依頼差戻',
    CFP_RESPONSED: 'CFP/DQR回答',
    CFP_UPDATED: 'CFP/DQR回答変更',
    REPLY_MESSAGE_REGISTERED: '応答メッセージ登録'
  };
  return map[notificationType];
}

/**
 * 通知を通知元で分類する。
 * 依頼先からの通知 = respondent
 * 依頼元からの通知 = requestor
 * @param notificationType 通知タイプ
 * @returns 分類結果
 */
export function classifyNotificationBySource(
  notificationType: NotificationTypes
) {
  const map: { [key in NotificationTypes]: 'respondent' | 'requestor' } = {
    CFP_RESPONSED: 'respondent',
    CFP_UPDATED: 'respondent',
    REQUEST_REJECTED: 'respondent',
    REQUEST_NEW: 'requestor',
    REQUEST_CANCELED: 'requestor',
    REPLY_MESSAGE_REGISTERED: 'respondent'
  };
  return map[notificationType];
}

/**
 * 2つの配列を結合する。
 * @param a 1つめの配列
 * @param b 2つめの配列
 * @returns 結合結果の配列
 */
export function zip<A, B>(a: A[], b: B[]): [A, B][] {
  const res: [A, B][] = [];
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    res.push([a[i], b[i]]);
  }
  return res;
}

/**
 * 自社部品かどうかを判定する。
 * @param level 親部品は1, 子部品は2
 * @param terminatedFlag 終端フラグ
 * @returns 判定結果の真偽値
 */
export function isOwnParts(
  level: Parts['level'],
  terminatedFlag: Parts['terminatedFlag']
) {
  return terminatedFlag || level === 1;
}

/**
 * formikのバリデーションエラーを取得する。
 * @param name formikのフィールド名
 * @param formik errorsとtouchedを含むオブジェクト
 * @returns 該当フィールドのエラーメッセージの文字列
 */
export function getFormikErrorMessage({
  name,
  formik,
}: {
  name: string;
  formik: { errors: FormikErrors<unknown>; touched: FormikTouched<unknown>; };
}) {
  const error = getIn(formik.errors, name);
  // エラーがない場合に加え、入れ子の内部でエラーが起こっているときに
  // 入れ子の外側を参照した場合などstring以外が返る場合、undefinedを返す
  if (typeof error !== 'string') {
    return undefined;
  }
  const touched = getIn(formik.touched, name) as boolean | undefined;
  return touched ? error : undefined;
}

/**
 * 配列を指定された件数ごとにchunkする。
 * @param array chunk対象の配列
 * @param chunkSize 件数
 * @returns chunkされた配列を含む配列
 */
export function splitArrayIntoChunks<T>(array: T[], chunkSize: number) {
  return array.flatMap((_, index, array) => {
    if (index % chunkSize === 0) {
      return [array.slice(index, index + chunkSize)];
    } else {
      return [];
    }
  });
}

/**
 * バイト単位で受け取ったファイルサイズを単位付き表記に変換する。
 * @param size ファイルサイズ（バイト）
 * @returns 単位付きサイズ表記の文字列
 */
export function fileSizeToString(size: number) {
  const BASE = 1024;
  const LIMIT_EXP = 2; // MB以降は計算を打ち切る
  let mantissa = size;
  let exp = 0;
  for (exp; exp < LIMIT_EXP; exp++, mantissa = mantissa / BASE) {
    if (mantissa < BASE) {
      break;
    }
  }

  let prefix = '';
  switch (exp) {
    case 0:
      prefix = '';
      break;
    case 1:
      prefix = 'K';
      break;
    default:
      prefix = 'M';
      break;
  }
  return `${roundUpDecimalPlace(mantissa)} ${prefix}B`;
}

/**
 * 非同期処理のsuccessとerrorが含まれるオブジェクトを返す。
 * @returns successとerrorが含まれるオブジェクト
 */
export async function returnErrorAsValue<T>(
  callBackFn: () => Promise<T>
): Promise<{ success: T | undefined; error: Error | undefined; }> {
  try {
    const result = await callBackFn();
    return { success: result, error: undefined };
  } catch (error) {
    if (error instanceof Error) return { success: undefined, error };
    throw error;
  }
}

/**
 * 数値に変換できる文字列かを判定する。
 * @param value 判定対象の文字列
 * @returns 判定結果の真偽値
 */
export function isValidNumberString(value: string) {
  return value.match(/^([1-9]\d*|0)(\.\d+)?$/) !== null;
}

/**
 * 一定間隔で非同期処理を再試行する。
 * @param getPromiseArray Promiseの配列
 * @param waitingTime 再試行の間隔
 * @returns Promise実行結果
 */
export async function retryWithInterval<T>(
  getPromiseArray: (() => Promise<T>)[], // 単体テストの都合上関数の配列を受け取るようにしている
  waitingTime: number //単位はミリ秒
): Promise<T> {
  let shouldStop = false;
  async function runAfter(t: number, f: () => Promise<T>) {
    await new Promise((resolve) => setTimeout(resolve, t));
    if (shouldStop) {
      throw Error('stop');
    }
    return await f();
  }

  try {
    const result = await Promise.any(
      getPromiseArray.map((f, i) => runAfter(i * waitingTime, f))
    );
    shouldStop = true;
    return result;
  } catch (errors) {
    // すべて失敗した場合
    if (errors instanceof AggregateError) {
      const es = errors.errors;
      throw es[es.length - 1];
    } else throw errors; //AggregateError以外は返ってこない想定なので、ここは実質到達不能な行
  }
}

/**
 * 単位から排出量単位を返却する。
 * @param amountRequiredUnit 単位
 * @returns 排出量単位
 */
export function selectUnitFromAmountRequiredUnit(
  amountRequiredUnit?: AmountRequiredUnit
): CfpUnits {
  switch (amountRequiredUnit) {
    case 'liter':
      return CfpUnits.KgCO2eliter;
    case 'kilogram':
      return CfpUnits.KgCO2ekilogram;
    case 'cubic-meter':
      return CfpUnits.KgCO2ecubicMeter;
    case 'kilowatt-hour':
      return CfpUnits.KgCO2ekilowattHour;
    case 'megajoule':
      return CfpUnits.KgCO2emegajoule;
    case 'ton-kilometer':
      return CfpUnits.KgCO2etonKilometer;
    case 'square-meter':
      return CfpUnits.KgCO2esquareMeter;
    case 'unit':
      return CfpUnits.KgCO2eunit;
    default:
      return CfpUnits.KgCO2eunit;
  }
}

/**
 * 小数点以下または整数でフォーマットする。
 * @param value フォーマット対象の文字列
 * @param roundUpNumber 残す小数点の数
 * @returns フォーマット後の文字列
 */
export function formatNumber(value: number, roundUpNumber?: number): string {
  // roundUpNumberに指定がない場合は1を設定する
  const rounded = roundUpDecimalPlace(value, roundUpNumber);
  // 小数点以下が存在するかどうかをチェック
  if (value % 1 !== 0) {
    // 切り上げ後も小数点以下があるかチェック
    return rounded % 1 ? rounded.toString() : rounded.toFixed(1);
  } else {
    // 整数だった場合は、そのまま整数を返す
    return value.toString();
  }
}

/**
 * CSVファイルをダウンロードする。
 * @param headers ヘッダー項目の配列
 * @param data データの配列
 * @param filename 保存先ファイル名
 * @returns
 */
export function downloadCsv(
  headers: string[],
  data: (string | number | undefined)[][],
  filename: string
) {
  const csvRows = [];
  // CSVのヘッダー行の追加
  const headerRow = headers
    .map((header) => `"${header.replace(/"/g, '""')}"`)
    .join(',');
  csvRows.push(headerRow);

  // データ行の追加
  data.forEach((row) => {
    const rowString = row
      .map((cell) => {
        if (cell === undefined || cell === null) {
          return '';
        } else if (typeof cell === 'number') {
          // 数値はそのまま表示
          return cell;
        } else {
          // 文字列はダブルクォーテーションで囲み、ダブルクォーテーションを二重にする
          const cellString = cell.replace(/"/g, '""');
          return `"${cellString}"`; // 文字列をダブルクォーテーションで囲む
        }
      })
      .join(',');
    csvRows.push(rowString);
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * 現在の日時をyyyyMMddhhmm形式の文字列で取得する。
 */
export const getCurrentDateTime = () => {
  const now = new Date();
  return `${now.getFullYear()}${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now
      .getHours()
      .toString()
      .padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * 特定の事業所の詳細情報を取得する。
 * @param plantId 事業所識別子
 * @param plants 事業所の配列
 * @returns 事業所の詳細情報
 */
export function getPlantDetails(plantId: string | undefined, plants: Plant[]) {
  const plant = plants.find((plant) => plant.plantId === plantId);
  return {
    plantName: plant ? plant.plantName : '',
    openPlantId: plant ? plant.openPlantId : '',
  };
}

/**
 * 与えられた数値を表す文字列の整数部の桁数がdigits以下かどうか判定する。
 * @param numStr 数値を表す文字列
 * @param digits 整数部の桁数の最大許容値
 * @returns 判定結果の真偽値
 */
export function isIntegerPartDigitsWithin(numStr: string, digits: number) {
  return numStr.split('.')[0].length <= digits;
}

/**
 * 与えられた数値を表す文字列の小数部の桁数がdigits以下かどうか判定する。
 * @param numStr 数値を表す文字列
 * @param digits 小数部の桁数の最大許容値
 * @returns 判定結果の真偽値
 */
export function isDecimalPartDigitsWithin(numStr: string, digits: number) {
  return (numStr.split('.').at(1) ?? '').length <= digits;
}

/**
 * formに起因してstring|numberとなっている数値を表す文字列をnumber|undefinedに変換する。
 * @param numStr 数値を表す文字列
 * @returns 変換後の値
 */
export function convertFormNumberToNumber(
  numStr: string | number | undefined | null
) {
  return numStr === undefined ||
    numStr === null ||
    numStr === '' ||
    !isValidNumberString(numStr.toString())
    ? undefined
    : Number(numStr);
}

/**
 * nullishな値を空文字に変換する。
 * @param str
 * @returns strがnullishな場合空文字・それ以外の場合strを返却
 */
export function convertNullishToEmptyStr(str: string | undefined | null) {
  return str ?? '';
}

/**
 * 重複している構成部品のIndexを取得する。
 * @param parts 構成部品を含む配列
 * @return 重複している構成部品のIndexを含む配列
 */
export function getDuplicatePartsIndexList(parts: Parts[]): Array<number[]> {
  return parts.reduce<Array<number[]>>((results, part, index) => {
    const duplicateIndex = parts.findIndex(
      (item) =>
        item.partsName === part.partsName &&
        item.supportPartsName === part.supportPartsName &&
        item.plantId === part.plantId
    );
    if (duplicateIndex !== index) {
      const existIndex = results.findIndex((item) =>
        item.includes(duplicateIndex)
      );
      if (existIndex !== -1) {
        results.splice(existIndex, 1, [...results[existIndex], ...[index]]);
      } else {
        results.push([duplicateIndex, index]);
      }
    }
    return results;
  }, []);
}

/**
 * 重複時のエラーメッセージを取得する。
 * @param duplicateIndexList 重複している構成部品のIndexを含む配列
 * @param parts 部品の配列
 * @param plants 事業所の配列
 * @return 重複時のエラーメッセージ
 */
export function getDuplicateMessage(
  duplicateIndexList: number[],
  parts: Parts[],
  plants: Plant[]
) {
  let errorMessage = '構成部品の';
  duplicateIndexList.forEach((duplicateIndex, index) => {
    switch (true) {
      case duplicateIndex === 0:
        errorMessage = '親部品と' + errorMessage;
        break;
      case duplicateIndexList.length - 1 === index:
        errorMessage =
          errorMessage + `${duplicateIndex}行目が重複しています。`;
        break;
      default:
        errorMessage = errorMessage + `${duplicateIndex}行目と`;
    }
  });
  const partPlant = plants.find(
    (plant) => plant.plantId === parts[duplicateIndexList[0]].plantId
  );
  const { partsName, supportPartsName } = parts[duplicateIndexList[0]];
  const errorPart = `（${partsName}・${supportPartsName}・${partPlant?.plantName},${partPlant?.openPlantId}）`;

  return errorMessage + errorPart;
}

/**
 * PartsStructure内でPartsの重複がある場合、エラーメッセージを返す。
 * @param partsStructure バリデーション対象のPartsStructure
 * @param plants エラーメッセージ表示用のplantの一覧
 * @return 重複がある場合エラーメッセージ、なければundefined
 */
export function validatePartsDuplication(
  partsStructure: PartsStructure,
  plants: Plant[]
): string | undefined {
  const parts: Parts[] = [
    partsStructure.parentParts,
    ...partsStructure.childrenParts,
  ];
  // 重複しているIndexを取得
  const duplicatePartsIndexes: Array<number[]> =
    getDuplicatePartsIndexList(parts);

  if (duplicatePartsIndexes.length === 0) return undefined;
  const errorMessage = duplicatePartsIndexes
    .map((partsIndexList) => getDuplicateMessage(partsIndexList, parts, plants))
    .join('\n');
  return errorMessage;
}
