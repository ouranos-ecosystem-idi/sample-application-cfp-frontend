import { renderHook, waitFor } from '@testing-library/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  AmountRequiredUnit,
  CfpUnits,
  DqrValueType,
  Parts,
  Plant,
  TradeRequestDataTypeWithOperator,
} from './types';
import {
  calcCfpSum,
  calcDqrSum,
  calcDqrValue,
  calcDqrValues,
  classifyNotificationBySource,
  convertFormNumberToNumber,
  convertNullishToEmptyStr,
  downloadCsv,
  fileSizeToString,
  formatNumber,
  getCurrentDateTime,
  getDuplicateMessage,
  getDuplicatePartsIndexList,
  getFormikErrorMessage,
  getNotificationTypeName,
  getPlantDetails,
  getRequestStatus,
  getResponseStatus,
  getTradeRequestStatusColor,
  getTradeRequestStatusName,
  isDecimalPartDigitsWithin,
  isEmpty,
  isIntegerPartDigitsWithin,
  isOwnParts,
  isValidNumberString,
  retryWithInterval,
  returnErrorAsValue,
  roundUpDecimalPlace,
  sanitizeUrl,
  selectUnitFromAmountRequiredUnit,
  separateTradeRequestDataByRequestedStatus,
  splitArrayIntoChunks,
  sum,
  sumDenyUndefined,
  tradeResponseStatusAttributes,
  validatePartsDuplication,
  zip,
} from './utils';

describe('sumDenyUndefined', () => {
  test('複数値', () => {
    expect(sumDenyUndefined(1)).toBe(1);
    expect(sumDenyUndefined(1, 2)).toBe(3);
    expect(sumDenyUndefined(1, 2, 3, 4)).toBe(10);
  });

  test('undefinedを含む', () => {
    expect(sumDenyUndefined(undefined)).toBeUndefined();
    expect(sumDenyUndefined(undefined, 1, 2)).toBeUndefined();
    expect(sumDenyUndefined(undefined, undefined)).toBeUndefined();
  });

  test('小数の計算が正確に実行できる', () => {
    expect(sumDenyUndefined(0.1, 0.2)).toBe(0.3);
    expect(0.1 + 0.2).not.toBe(0.3);
  });
});

describe('sum', () => {
  test('複数値の加算結果が返却される', () => {
    expect(sum(1)).toBe(1);
    expect(sum(1.1, 2.1)).toBe(3.2);
    expect(sum(1, 2, 3, 4)).toBe(10);
  });

  test('undefinedは0として扱われる', () => {
    expect(sum(undefined)).toBe(0);
    expect(sum(undefined, 1, 2)).toBe(3);
    expect(sum(undefined, undefined)).toBe(0);
  });

  test('小数の計算が正確に実行できる', () => {
    expect(sum(0.1, 0.2)).toBe(0.3);
    expect(0.1 + 0.2).not.toBe(0.3);
  });
});

describe('calcCfpSum', () => {
  const testData: Parameters<typeof calcCfpSum>[0] = [
    {
      amountRequired: 1,
      preEmission: 100,
      mainEmission: 1000,
    },
    {
      amountRequired: 2,
      preEmission: 10,
      mainEmission: 100,
    },
    {
      amountRequired: 0.5,
      preEmission: 1,
      mainEmission: 10,
    },
    {
      amountRequired: 1,
      preEmission: 1000,
    },
    {
      amountRequired: 1,
      mainEmission: 10000,
    },
    {
      amountRequired: 1000,
    },
  ];
  test('前処理・主な製造それぞれ活動量と掛けた値の合計が返却される', () => {
    expect(calcCfpSum(testData)).toStrictEqual({
      preEmission: 1120.5,
      mainEmission: 11205,
    });
  });
  test('cfp情報のない入力のみの場合結果のemissionは0となる', () => {
    expect(calcCfpSum([{ amountRequired: 1000 }])).toStrictEqual({
      preEmission: 0,
      mainEmission: 0,
    });
  });
  test('小数の計算が正確に実行できる', () => {
    expect(
      calcCfpSum([
        {
          amountRequired: 3,
          preEmission: 0.1,
          mainEmission: 0.7,
        },
        {
          amountRequired: 3,
          preEmission: 0.1,
          mainEmission: 0.7,
        },
      ])
    ).toStrictEqual({
      preEmission: 0.6,
      mainEmission: 4.2,
    });
    expect(0.1 * 3 + 0.1 * 3).not.toBe(0.6);
    expect(0.7 * 3 + 0.7 * 3).not.toBe(4.2);
  });
});

describe('calcDqrValue', () => {
  const testData: {
    targets: { dqrValue: number; amountRequired: number; emission: number; }[];
    parent: {
      emission: number;
      dqrValue: number;
    };
  } = {
    targets: [
      {
        dqrValue: 2.1,
        amountRequired: 0.5,
        emission: 10,
      },
      {
        dqrValue: 2.3,
        amountRequired: 20,
        emission: 0.2,
      },
      {
        dqrValue: 2.2,
        amountRequired: 30,
        emission: 0.4,
      },
    ],
    parent: {
      emission: 10,
      dqrValue: 2,
    },
  };
  test('正常系', () => {
    expect(calcDqrValue(testData.targets, testData.parent)).toStrictEqual('2.13226');
  });

  test('CFPの合計が0', () => {
    expect(calcDqrValue([], { emission: 0, dqrValue: 0 })).toStrictEqual('0');
  });
});

describe('calcDqrValues', () => {
  const testData: {
    targets: Array<
      {
        amountRequired: number;
        emission: number;
      } & DqrValueType
    >;
    parent: DqrValueType & {
      emission: number;
    };
  } = {
    targets: [
      {
        amountRequired: 0.5,
        emission: 10,
        TeR: undefined,
        TiR: undefined,
        GeR: undefined,
      },
      {
        amountRequired: 20,
        emission: 0.2,
        TeR: 3.0,
        TiR: 1.9,
        GeR: 2.3,
      },
      {
        amountRequired: 30,
        emission: 0.4,
        TeR: 3.0,
        TiR: 1.5,
        GeR: 2.2,
      },
    ],
    parent: {
      emission: 10,
      TeR: 2,
      TiR: 1,
      GeR: 2,
    },
  };
  test('DQR値を計算する', () => {
    expect(calcDqrValues(testData.targets, testData.parent)).toStrictEqual({
      TeR: '2.19355',
      TiR: '1.14839',
      GeR: '1.79355',
      dqr: '1.71183',
    });
  });

  test('親部品のDQR値がない場合', () => {
    const testData: {
      targets: Array<
        {
          amountRequired: number;
          emission: number;
        } & DqrValueType
      >;
      parent: DqrValueType & {
        emission: number;
      };
    } = {
      targets: [
        {
          amountRequired: 0.5,
          emission: 10,
          TeR: 2.0,
          TiR: 3.2,
          GeR: 2.1,
        },
        {
          amountRequired: 20,
          emission: 0.2,
          TeR: 3.0,
          TiR: 1.9,
          GeR: 2.3,
        },
        {
          amountRequired: 30,
          emission: 0.4,
          TeR: 3.0,
          TiR: 1.5,
          GeR: 2.2,
        },
      ],
      parent: {
        emission: 10,
        TeR: undefined,
        TiR: undefined,
        GeR: undefined,
      },
    };
    expect(calcDqrValues(testData.targets, testData.parent)).toStrictEqual({
      TeR: '1.87097',
      TiR: '1.34194',
      GeR: '1.4871',
      dqr: '1.56667',
    });
  });
});

describe('calcDqrSum', () => {
  const testData: {
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
    }[];
    parent: {
      preEmission?: number;
      mainEmission?: number;
      preTeR?: number;
      preTiR?: number;
      preGeR?: number;
      mainTeR?: number;
      mainTiR?: number;
      mainGeR?: number;
    };
  } = {
    targets: [
      {
        amountRequired: 30,
        preEmission: 0.4,
        preTeR: 3.0,
        preTiR: 1.5,
        preGeR: 2.2,
        mainEmission: 0.4,
        mainTeR: 3.0,
        mainTiR: 1.5,
        mainGeR: 2.2,
      },
      {
        amountRequired: 30,
        preEmission: 0.4,
        preTeR: 3.0,
        preTiR: 1.5,
        preGeR: 2.2,
        mainEmission: 0.4,
        mainTeR: 3.0,
        mainTiR: 1.5,
        mainGeR: 2.2,
      },
      {
        amountRequired: 30,
      },
    ],
    parent: {},
  };
  test('正常系', () => {
    expect(calcDqrSum(testData.targets, testData.parent)).toStrictEqual({
      preEmission: { dqr: '2.23334', TeR: '3', GeR: '2.2', TiR: '1.5', },
      mainEmission: { dqr: '2.23334', TeR: '3', GeR: '2.2', TiR: '1.5' },
    });
  });
});

describe('getTradeRequestStatusName', () => {
  test('incompleteは依頼未完了', () => {
    expect(getTradeRequestStatusName('incomplete')).toBe('依頼未完了');
  });
  test('registering-partsは部品登録中', () => {
    expect(getTradeRequestStatusName('registering-parts')).toBe('部品登録中');
  });
  test('registering-cfpはCFP登録中', () => {
    expect(getTradeRequestStatusName('registering-cfp')).toBe('CFP登録中');
  });
  test('receivedは回答受領済', () => {
    expect(getTradeRequestStatusName('received')).toBe('回答受領済');
  });
  test('remandedは差戻し', () => {
    expect(getTradeRequestStatusName('remanded')).toBe('差戻し');
  });
  test('canceledは取消', () => {
    expect(getTradeRequestStatusName('canceled')).toBe('取消');
  });
});

describe('tradeResponseStatusAttributes', () => {
  test('incompleteはyellow/回答未完了', () => {
    expect(tradeResponseStatusAttributes['incomplete']).toEqual({
      badgeColor: 'yellow',
      label: '回答未完了',
    });
  });
  test('sentはgray/回答送信済', () => {
    expect(tradeResponseStatusAttributes['sent']).toEqual({
      badgeColor: 'gray',
      label: '回答送信済',
    });
  });
  test('remandedはred/差戻し', () => {
    expect(tradeResponseStatusAttributes['remanded']).toEqual({
      badgeColor: 'red',
      label: '差戻し',
    });
  });
});

describe('getTradeRequestStatusColor', () => {
  test('依頼未完了はyellow', () => {
    expect(getTradeRequestStatusColor('incomplete')).toBe('yellow');
  });
  test('部品登録中はblue', () => {
    expect(getTradeRequestStatusColor('registering-parts')).toBe('blue');
  });
  test('CFP登録中はblue', () => {
    expect(getTradeRequestStatusColor('registering-cfp')).toBe('blue');
  });
  test('回答受領済はgray', () => {
    expect(getTradeRequestStatusColor('received')).toBe('gray');
  });
  test('差戻しはred', () => {
    expect(getTradeRequestStatusColor('remanded')).toBe('red');
  });
  test('取消はgray', () => {
    expect(getTradeRequestStatusColor('canceled')).toBe('gray');
  });
});

describe('separateTradeRequestDataByRequestedStatus', () => {
  const parentParts: Parts = {
    level: 1,
    amountRequired: 10,
    amountRequiredUnit: 'kilogram',
    operatorId: 'aaa',
    partsName: 'aaa',
    plantId: 'aaa',
    supportPartsName: 'aaa',
    terminatedFlag: false,
    traceId: 'aaa',
  };
  const unterminatedChildParts: Parts = {
    level: 2,
    amountRequired: 10,
    amountRequiredUnit: 'kilogram',
    operatorId: 'bbb',
    partsName: 'bbb',
    plantId: 'bbb',
    supportPartsName: 'bbb',
    terminatedFlag: false,
    traceId: 'bbb',
  };
  const terminatedChildParts: Parts = {
    level: 2,
    amountRequired: 10,
    amountRequiredUnit: 'kilogram',
    operatorId: 'ccc',
    partsName: 'ccc',
    plantId: 'ccc',
    supportPartsName: 'ccc',
    terminatedFlag: true,
    traceId: 'ccc',
  };

  const requestedData: TradeRequestDataTypeWithOperator[] = [
    {
      downStreamPart: unterminatedChildParts,
      tradeId: 'aaa',
      tradeStatus: {
        requestStatus: {
          cfpResponseStatus: 'NOT_COMPLETED',
          tradeTreeStatus: 'UNTERMINATED',
        }
      },
      operator: {
        operatorId: 'ope',
        openOperatorId: 'openope',
        operatorName: 'opename',
      },
    },
    {
      downStreamPart: unterminatedChildParts,
      tradeId: 'bbb',
      tradeStatus: {
        requestStatus: {
          cfpResponseStatus: 'NOT_COMPLETED',
          tradeTreeStatus: 'UNTERMINATED',
        }
      },
      operator: {
        operatorId: 'ope',
        openOperatorId: 'openope',
        operatorName: 'opename',
      },
    },
    {
      downStreamPart: unterminatedChildParts,
      tradeId: 'ccc',
      tradeStatus: {
        requestStatus: {
          cfpResponseStatus: 'COMPLETED',
          tradeTreeStatus: 'TERMINATED',
        }
      },
      operator: {
        operatorId: 'ope',
        openOperatorId: 'openope',
        operatorName: 'opename',
      },
    },
  ];
  const notRequestedData: TradeRequestDataTypeWithOperator[] = [
    {
      downStreamPart: unterminatedChildParts,
      tradeId: 'xxx',
      operator: {
        operatorId: 'ope',
        openOperatorId: 'openope',
        operatorName: 'opename',
      },
    },
    {
      downStreamPart: unterminatedChildParts,
      tradeId: 'yyy',
      operator: {
        operatorId: 'ope',
        openOperatorId: 'openope2',
        operatorName: 'opename2',
      }
    },
  ];
  const notApplicableData: TradeRequestDataTypeWithOperator[] = [
    {
      downStreamPart: parentParts,
      tradeId: 'zzz',
      operator: {
        operatorId: 'ope',
        openOperatorId: 'openope',
        operatorName: 'opename',
      }
    },
    {
      downStreamPart: terminatedChildParts,
      tradeId: 'zzz',
      operator: {
        operatorId: 'ope',
        openOperatorId: 'openope',
        operatorName: 'opename',
      }
    },
  ];

  test('空配列を渡すと両方空配列が入る', () => {
    expect(separateTradeRequestDataByRequestedStatus([])).toStrictEqual({
      requestedData: [],
      notRequestedData: [],
    });
  });
  test('未送信の依頼のみ渡すとすべてnotRequestedDataに入りrequestedDataは空配列', () => {
    expect(
      separateTradeRequestDataByRequestedStatus(notRequestedData)
    ).toStrictEqual({
      requestedData: [],
      notRequestedData,
    });
  });
  test('送信済みの依頼のみ渡すとすべてrequestedDataに入りnotRequestedDataは空配列', () => {
    expect(
      separateTradeRequestDataByRequestedStatus(requestedData)
    ).toStrictEqual({
      requestedData,
      notRequestedData: [],
    });
  });
  test('混在の場合は送信済がrequestedData,未送信がnotRequestedDataに振り分けられ、対象外データは除外される', () => {
    expect(
      separateTradeRequestDataByRequestedStatus([
        ...requestedData,
        ...notRequestedData,
        ...notApplicableData,
      ])
    ).toStrictEqual({
      requestedData,
      notRequestedData,
    });
  });
});

describe('getResponseStatus', () => {
  test('依頼未完了', () => {
    expect(
      getResponseStatus('NOT_COMPLETED')
    ).toBe('incomplete');
  });

  test('回答受領済', () => {
    expect(
      getResponseStatus('COMPLETED')
    ).toBe('sent');
  });

  test('差戻し', () => {
    expect(
      getResponseStatus('REJECT')
    ).toBe('remanded');
  });
});

describe('getRequestStatus', () => {
  test('CFP登録中', () => {
    expect(
      getRequestStatus({
        cfpResponseStatus: 'NOT_COMPLETED',
        tradeTreeStatus: 'TERMINATED',
      })
    ).toBe('registering-cfp');
  });

  test('部品登録中', () => {
    expect(
      getRequestStatus({
        cfpResponseStatus: 'NOT_COMPLETED',
        tradeTreeStatus: 'UNTERMINATED',
      })
    ).toBe('registering-parts');
  });

  test('回答受領済', () => {
    expect(
      getRequestStatus({
        cfpResponseStatus: 'COMPLETED',
        tradeTreeStatus: 'TERMINATED',
      })
    ).toBe('received');
  });

  test('差戻し', () => {
    expect(
      getRequestStatus({
        cfpResponseStatus: 'REJECT',
        tradeTreeStatus: 'UNTERMINATED',
      })
    ).toBe('remanded');
  });

  test('取消', () => {
    expect(
      getRequestStatus({
        cfpResponseStatus: 'CANCEL',
        tradeTreeStatus: 'TERMINATED',
      })
    ).toBe('canceled');
  });

  test('リスト内の順番に関係なくworkする', () => {
    expect(
      getRequestStatus({
        cfpResponseStatus: 'COMPLETED',
        tradeTreeStatus: 'TERMINATED',
      })
    ).toBe('received');
  });
});

describe('isEmpty', () => {
  test('undefinedはtrue', () => {
    expect(isEmpty(undefined)).toBe(true);
  });
  test('nullはtrue', () => {
    expect(isEmpty(null)).toBe(true);
  });
  test('空文字はtrue', () => {
    expect(isEmpty('')).toBe(true);
  });
  test('0はfalse', () => {
    expect(isEmpty(0)).toBe(false);
  });
});

describe('sanitizeUrl', () => {
  test('URL形式はそのまま返却', () => {
    const url = 'https://example.com/aaa?param=11:1:1';
    expect(sanitizeUrl(url)).toBe(url);
  });
  test('URL形式でない場合はundefinedを返却case1', () => {
    const url = 'example.com';
    expect(sanitizeUrl(url)).toBeUndefined();
  });
  test('URL形式でない場合はundefinedを返却case2', () => {
    const url = 'javascript:alert("AAA");';
    expect(sanitizeUrl(url)).toBeUndefined();
  });
});

describe('roundUpSecondDecimalPlace', () => {
  test('指定された小数点から切り上げる', () => {
    expect(roundUpDecimalPlace(1.0005)).toBe(1.1);
    expect(roundUpDecimalPlace(1.0005, 2)).toBe(1.01);
    expect(roundUpDecimalPlace(0.00000000001, 5)).toBe(0.00001);
  });
});

describe('getNotificationTypeName', () => {
  test('REQUEST_NEWは依頼登録', () => {
    expect(getNotificationTypeName('REQUEST_NEW')).toBe('依頼登録');
  });
  test('REQUEST_CANCELEDは依頼取消', () => {
    expect(getNotificationTypeName('REQUEST_CANCELED')).toBe('依頼取消');
  });
  test('REQUEST_REJECTEDは依頼差戻', () => {
    expect(getNotificationTypeName('REQUEST_REJECTED')).toBe('依頼差戻');
  });
  test('CFP_RESPONSEDはCFP回答', () => {
    expect(getNotificationTypeName('CFP_RESPONSED')).toBe('CFP/DQR回答');
  });
  test('CFP_UPDATEDはCFP回答変更', () => {
    expect(getNotificationTypeName('CFP_UPDATED')).toBe('CFP/DQR回答変更');
  });
  test('REPLY_MESSAGE_REGISTEREDは応答メッセージ登録', () => {
    expect(getNotificationTypeName('REPLY_MESSAGE_REGISTERED')).toBe('応答メッセージ登録');
  });
});

describe('classifyNotificationBySource', () => {
  test('CFP_RESPONSEDは依頼先からの通知', () => {
    expect(classifyNotificationBySource('CFP_RESPONSED')).toBe('respondent');
  });
  test('CFP_UPDATEDは依頼先からの通知', () => {
    expect(classifyNotificationBySource('CFP_UPDATED')).toBe('respondent');
  });
  test('REQUEST_REJECTEDは依頼先からの通知', () => {
    expect(classifyNotificationBySource('REQUEST_REJECTED')).toBe('respondent');
  });
  test('REQUEST_NEWは依頼元からの通知', () => {
    expect(classifyNotificationBySource('REQUEST_NEW')).toBe('requestor');
  });
  test('REQUEST_CANCELEDは依頼元からの通知', () => {
    expect(classifyNotificationBySource('REQUEST_CANCELED')).toBe('requestor');
  });
  test('REPLY_MESSAGE_REGISTEREDは依頼元からの応答メッセージ', () => {
    expect(classifyNotificationBySource('REPLY_MESSAGE_REGISTERED')).toBe('respondent');
  });
});

describe('zip', () => {
  function getRandomInt(): number {
    return Math.floor(Math.random() * 1000 + 1);
  }
  function getRandomLengthArray(): number[] {
    return Array.from({ length: getRandomInt() }, getRandomInt);
  }

  test('配列の小さい方に長さがそろう', () => {
    const as = getRandomLengthArray();
    const bs = getRandomLengthArray();
    expect(zip(as, bs).length).toBe(Math.min(as.length, bs.length));
  });

  test('空の配列とzipしたら空の配列になる', () => {
    expect(zip([], getRandomLengthArray()).length).toBe(0);
    expect(zip(getRandomLengthArray(), []).length).toBe(0);
  });

  test('zipして生成された配列を、元の配列とzipすると全て同じ要素になる', () => {
    const as = getRandomLengthArray();
    const bs = getRandomLengthArray();
    const zipped = zip(as, bs);
    const zas = zipped.map(([a, _]) => a);
    const zbs = zipped.map(([_, b]) => b);
    expect(zip(as, zas).every(([a, za]) => a === za)).toBe(true);
    expect(zip(bs, zbs).every(([b, zb]) => b === zb)).toBe(true);
  });
});

describe('isOwnParts', () => {
  test('終端親部品は自社', () => {
    expect(isOwnParts(1, true)).toBe(true);
  });
  test('非終端親部品は自社', () => {
    expect(isOwnParts(1, false)).toBe(true);
  });
  test('終端構成部品は自社', () => {
    expect(isOwnParts(2, true)).toBe(true);
  });
  test('非終端構成部品は他社', () => {
    expect(isOwnParts(2, false)).toBe(false);
  });
});

describe('getFormikErrorMessage', () => {
  const validationSchema = Yup.object({
    fieldA: Yup.number().max(10, 'fieldAError'),
    fieldB: Yup.array()
      .of(
        Yup.object({
          fieldBInner: Yup.number().max(10, 'fieldBInnerError'),
        })
      )
      .min(1, 'fieldBError'),
  });
  const initialValues = {
    fieldA: 1,
    fieldB: [
      {
        fieldBInner: 1,
      },
    ],
  };
  function onSubmit() { }
  test('指定したフィールドにエラーがない場合undefinedを返す', async () => {
    const { result } = renderHook(() =>
      useFormik({
        initialValues,
        validationSchema,
        onSubmit,
      })
    );

    await waitFor(() => {
      result.current.setFieldValue('fieldA', 1);
    });
    await waitFor(() => {
      result.current.setFieldTouched('fieldA', true);
    });
    await waitFor(() => {
      result.current.setFieldValue('fieldB', [{ fieldBInner: 2 }]);
    });
    await waitFor(() => {
      result.current.setFieldTouched('fieldB', true);
    });

    expect(
      getFormikErrorMessage({ name: 'fieldA', formik: result.current })
    ).toBe(undefined);
    expect(
      getFormikErrorMessage({ name: 'fieldB', formik: result.current })
    ).toBe(undefined);
    expect(
      getFormikErrorMessage({ name: 'fieldBInner', formik: result.current })
    ).toBe(undefined);
  });
  test('指定したフィールドにエラーがあり、touchedの場合エラーを返す', async () => {
    const { result } = renderHook(() =>
      useFormik({
        initialValues,
        validationSchema,
        onSubmit,
      })
    );
    await waitFor(() => {
      result.current.setFieldValue('fieldA', 1111);
    });
    await waitFor(() => {
      result.current.setFieldTouched('fieldA', true);
    });
    await waitFor(() => {
      result.current.setFieldValue('fieldB', []);
    });
    await waitFor(() => {
      result.current.setFieldTouched('fieldB', true);
    });

    expect(
      getFormikErrorMessage({ name: 'fieldA', formik: result.current })
    ).toBe('fieldAError');
    expect(
      getFormikErrorMessage({ name: 'fieldB', formik: result.current })
    ).toBe('fieldBError');
  });
  test('指定したフィールドにエラーがあり、touchedでない場合undefinedを返す', async () => {
    const { result } = renderHook(() =>
      useFormik({
        initialValues,
        validationSchema,
        onSubmit,
      })
    );
    await waitFor(() => {
      result.current.setFieldValue('fieldA', 1111);
    });
    await waitFor(() => {
      result.current.setFieldTouched('fieldA', false);
    });
    await waitFor(() => {
      result.current.setFieldValue('fieldB', []);
    });
    await waitFor(() => {
      result.current.setFieldTouched('fieldB', false);
    });

    expect(
      getFormikErrorMessage({ name: 'fieldA', formik: result.current })
    ).toBe(undefined);
    expect(
      getFormikErrorMessage({ name: 'fieldB', formik: result.current })
    ).toBe(undefined);
  });
  test('指定したフィールドの入れ子内部にエラーがある場合undefinedを返す', async () => {
    const { result } = renderHook(() =>
      useFormik({
        initialValues,
        validationSchema,
        onSubmit,
      })
    );

    await waitFor(() => {
      result.current.setFieldValue('fieldB', [{ fieldBInner: 11 }]);
    });
    await waitFor(() => {
      result.current.setFieldTouched('fieldB', true);
    });

    expect(
      getFormikErrorMessage({ name: 'fieldB', formik: result.current })
    ).toBe(undefined);
  });
});

describe('splitArrayIntoChunks', () => {
  test('配列を分割できる', () => {
    expect(
      splitArrayIntoChunks(['1', '2', '3', '4', '5', '6', '7', '8', '9'], 2)
    ).toEqual([['1', '2'], ['3', '4'], ['5', '6'], ['7', '8'], ['9']]);
    expect(splitArrayIntoChunks([], 1)).toEqual([]);
  });
});

describe('fileSizeToString', () => {
  test('0Bは0B', () => {
    expect(fileSizeToString(0)).toBe('0 B');
  });
  test('1023Bは1023B', () => {
    expect(fileSizeToString(1023)).toBe('1023 B');
  });
  test('1024Bは1KB', () => {
    expect(fileSizeToString(1024)).toBe('1 KB');
  });
  test('1048576Bは1MB', () => {
    expect(fileSizeToString(1048576)).toBe('1 MB');
  });
  test('1073741824Bは1024MB', () => {
    expect(fileSizeToString(1073741824)).toBe('1024 MB');
  });
  test('1550Bは繰り上げられ1.6KB', () => {
    expect(fileSizeToString(1550)).toBe('1.6 KB');
  });
});

describe('returnErrorAsValue', () => {
  async function successFn() {
    return true;
  }
  const error = new Error('fail');
  async function failFn() {
    throw error;
  }
  async function throwValueFn() {
    throw 'notError';
  }

  test('成功時はresultに結果が入る', async () => {
    expect(await returnErrorAsValue(successFn)).toEqual({
      success: true,
      error: undefined,
    });
  });
  test('失敗時はresultに結果が入る', async () => {
    expect(await returnErrorAsValue(failFn)).toEqual({
      success: undefined,
      error: error,
    });
  });
  test('Error以外がスローされた場合はそのままthrowする', async () => {
    await expect(returnErrorAsValue(throwValueFn)).rejects.toBe('notError');
  });
});

describe('isValidNumberString', () => {
  test('OKなケース', () => {
    expect(isValidNumberString('0')).toBe(true);
    expect(isValidNumberString('0.1')).toBe(true);
    expect(isValidNumberString('0.05')).toBe(true);
    expect(isValidNumberString('1')).toBe(true);
    expect(isValidNumberString('12')).toBe(true);
    expect(isValidNumberString('12.2')).toBe(true);
    expect(isValidNumberString('125.001')).toBe(true);
  });
  test('NGなケース', () => {
    expect(isValidNumberString('')).toBe(false);
    expect(isValidNumberString('.')).toBe(false);
    expect(isValidNumberString('.15')).toBe(false);
    expect(isValidNumberString('1.')).toBe(false);
    expect(isValidNumberString('１')).toBe(false);
    expect(isValidNumberString('１01')).toBe(false);
    expect(isValidNumberString('10１')).toBe(false);
    expect(isValidNumberString('011')).toBe(false);
    expect(isValidNumberString('011.1')).toBe(false);
    expect(isValidNumberString('abc')).toBe(false);
  });
});

describe('retryWithInterval', () => {
  const ok = 'ok';
  const ng = 'ng';
  async function successAfter(n: number, message: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, n));
    return message;
  }

  async function failAfter(n: number): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, n));
    throw new Error(ng);
  }

  const waitingTime = 200;

  test('成功時はresultに結果が入る', async () => {
    await expect(successAfter(100, ok)).resolves.toEqual(ok);
  });

  test('失敗時はErrorが発生する', async () => {
    await expect(failAfter(100)).rejects.toThrow(ng);
  });

  test('一つでも成功したら、最初に成功時の値を返す', async () => {
    await expect(
      retryWithInterval([() => successAfter(1, ok)], waitingTime)
    ).resolves.toEqual(ok);
    await expect(
      retryWithInterval(
        [
          () => failAfter(10),
          () => failAfter(10),
          () => successAfter(10, ok),
          () => successAfter(1, 'okokook'),
        ],
        waitingTime
      )
    ).resolves.toEqual(ok);
    await expect(
      retryWithInterval(
        [
          () => failAfter(10),
          () => successAfter(10000, 'okokook'),
          () => successAfter(10, ok),
        ],
        waitingTime
      )
    ).resolves.toEqual(ok);
  });

  test('全て失敗したら、エラーを投げる', async () => {
    await expect(
      retryWithInterval([() => failAfter(1)], waitingTime)
    ).rejects.toThrow(ng);
    await expect(
      retryWithInterval(
        [() => failAfter(1), () => failAfter(3), () => failAfter(1)],
        waitingTime
      )
    ).rejects.toThrow(ng);
  });
});

describe('selectUnitFromAmountRequiredUnit', () => {
  it('literの場合kgCO2e/literが返ってくる', () => {
    expect(selectUnitFromAmountRequiredUnit('liter')).toBe(
      CfpUnits.KgCO2eliter
    );
  });

  it('kilogramの場合kgCO2e/kilogramが返ってくる', () => {
    expect(selectUnitFromAmountRequiredUnit('kilogram')).toBe(
      CfpUnits.KgCO2ekilogram
    );
  });

  it('cubic-meterの場合kgCO2e/cubic-meterが返ってくる', () => {
    expect(selectUnitFromAmountRequiredUnit('cubic-meter')).toBe(
      CfpUnits.KgCO2ecubicMeter
    );
  });

  it('kilowatt-hourの場合kgCO2e/kilowatt-hourが返ってくる', () => {
    expect(selectUnitFromAmountRequiredUnit('kilowatt-hour')).toBe(
      CfpUnits.KgCO2ekilowattHour
    );
  });

  it('megajouleの場合kgCO2e/megajouleが返ってくる', () => {
    expect(selectUnitFromAmountRequiredUnit('megajoule')).toBe(
      CfpUnits.KgCO2emegajoule
    );
  });

  it('ton-kilometerの場合kgCO2e/ton-kilometerが返ってくる', () => {
    expect(selectUnitFromAmountRequiredUnit('ton-kilometer')).toBe(
      CfpUnits.KgCO2etonKilometer
    );
  });

  it('square-meterの場合kgCO2e/square-meterが返ってくる', () => {
    expect(selectUnitFromAmountRequiredUnit('square-meter')).toBe(
      CfpUnits.KgCO2esquareMeter
    );
  });

  it('unitの場合kgCO2e/unitが返ってくる', () => {
    expect(selectUnitFromAmountRequiredUnit('unit')).toBe(CfpUnits.KgCO2eunit);
  });

  it('上記以外の場合kgCO2e/unitが返ってくる', () => {
    expect(
      selectUnitFromAmountRequiredUnit('unknown' as AmountRequiredUnit)
    ).toBe(CfpUnits.KgCO2eunit);
  });
});

describe('formatNumber', () => {
  test('整数をそのまま文字列として返す', () => {
    expect(formatNumber(2)).toBe('2');
  });

  test('小数点第2位で切り上げられる', () => {
    expect(formatNumber(2.234)).toBe('2.3');
  });

  test('切り上げ後も小数点以下がある場合、そのまま文字列として返す', () => {
    expect(formatNumber(2.05)).toBe('2.1');
  });

  test('切り上げ後に整数になる場合、.0を付けて返す', () => {
    expect(formatNumber(1.91)).toBe('2.0');
  });
});

describe('downloadCsv', () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn();
    global.URL.revokeObjectURL = jest.fn();
    document.createElement = jest.fn().mockReturnValue({
      click: jest.fn(),
      setAttribute: jest.fn(),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('ヘッダーと行が正しいCSV形式でフォーマットされる', () => {
    const headers = ['ヘッダー1', 'ヘッダー2', 'ヘッダー3'];
    const data = [
      ['TestA', 1, 'A'],
      ['TestB', 2, 'B'],
      [undefined, 3, 'C'],
    ];
    const filename = 'テスト';

    downloadCsv(headers, data, filename);

    // Blobが正しいCSVコンテンツで形成されているかチェック
    const expectedCsvString =
      '"ヘッダー1","ヘッダー2","ヘッダー3"\n"TestA",1,"A"\n"TestB",2,"B"\n"",3,"C"';
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(
      new Blob([expectedCsvString], { type: 'text/csv;charset=utf-8;' })
    );
  });
});

describe('getCurrentDateTime', () => {
  const OriginalDate = Date; // オリジナルのDateコンストラクタを保存

  beforeAll(() => {
    const mockCurrentDate = new OriginalDate('2024-02-21T08:41:00.000Z');

    jest
      .spyOn(global, 'Date')
      .mockImplementation((...args: ConstructorParameters<typeof Date>) => {
        if (args.length) {
          // オリジナルのDateコンストラクタを使用
          return new OriginalDate(...args);
        }
        // モックされた固定日時のインスタンスをカスタマイズ
        const dateInstance = new OriginalDate(mockCurrentDate.getTime());
        dateInstance.getTimezoneOffset = () =>
          -mockCurrentDate.getTimezoneOffset();
        return dateInstance;
      }) as any;
  });

  afterAll(() => {
    jest.restoreAllMocks(); // モックをクリーンアップ
  });

  test('現在の日付と時刻をyyyyMMddhhmm形式の文字列で返す', () => {
    const mockCurrentDate = new Date('2024-02-21T08:41:00.000Z');
    const timezoneOffset = mockCurrentDate.getTimezoneOffset() * 60000; // 分単位のオフセットをミリ秒単位に変換
    const localDate = new Date(mockCurrentDate.getTime() - timezoneOffset);
    const expected = localDate
      .toISOString()
      .replace(/[-:T.]/g, '')
      .slice(0, 12);

    expect(getCurrentDateTime()).toBe(expected);
  });
});

describe('getPlantDetails', () => {
  test('指定したplantIdに対する正しいプラント詳細を返す', () => {
    const plants = [
      { plantId: '1', plantName: 'プラント1', openPlantId: '001' },
      { plantId: '2', plantName: 'プラント2', openPlantId: '002' },
    ];

    expect(getPlantDetails('1', plants)).toEqual({
      plantName: 'プラント1',
      openPlantId: '001',
    });

    // plantIdがundefinedの場合のテスト
    expect(getPlantDetails(undefined, plants)).toEqual({
      plantName: '',
      openPlantId: '',
    });
  });
});

describe('isIntegerPartDigitsWithin', () => {
  test('成功パターン', () => {
    expect(isIntegerPartDigitsWithin('100', 3)).toBe(true);
    expect(isIntegerPartDigitsWithin('100.111111', 3)).toBe(true);
    expect(isIntegerPartDigitsWithin('0.1', 3)).toBe(true);
    expect(isIntegerPartDigitsWithin('0', 3)).toBe(true);
    expect(isIntegerPartDigitsWithin('100', 5)).toBe(true);
  });
  test('失敗パターン', () => {
    expect(isIntegerPartDigitsWithin('1000', 3)).toBe(false);
    expect(isIntegerPartDigitsWithin('0000', 3)).toBe(false);
    expect(isIntegerPartDigitsWithin('1000.1', 3)).toBe(false);
    expect(isIntegerPartDigitsWithin('123456.111', 5)).toBe(false);
  });
});

describe('isDecimalPartDigitsWithin', () => {
  test('成功パターン', () => {
    expect(isDecimalPartDigitsWithin('1.11', 3)).toBe(true);
    expect(isDecimalPartDigitsWithin('1', 3)).toBe(true);
    expect(isDecimalPartDigitsWithin('1.111', 3)).toBe(true);
    expect(isDecimalPartDigitsWithin('100.0', 3)).toBe(true);
    expect(isDecimalPartDigitsWithin('0.00001', 5)).toBe(true);
  });
  test('失敗パターン', () => {
    expect(isDecimalPartDigitsWithin('1.1111', 3)).toBe(false);
    expect(isDecimalPartDigitsWithin('1.0000', 3)).toBe(false);
    expect(isDecimalPartDigitsWithin('10.1111', 3)).toBe(false);
    expect(isDecimalPartDigitsWithin('1.123456', 5)).toBe(false);
  });
});

describe('convertFormNumberToNumber', () => {
  test('numberはnumberのまま返す', () => {
    expect(convertFormNumberToNumber(1)).toBe(1);
    expect(convertFormNumberToNumber(1.11)).toBe(1.11);
    expect(convertFormNumberToNumber(0)).toBe(0);
  });
  test('数値を表す文字列はnumberにして返す', () => {
    expect(convertFormNumberToNumber('1')).toBe(1);
    expect(convertFormNumberToNumber('1.11')).toBe(1.11);
    expect(convertFormNumberToNumber('0')).toBe(0);
    expect(convertFormNumberToNumber('1.00')).toBe(1);
  });
  test('数値を表す文字列でない場合はundefinedを返す', () => {
    expect(convertFormNumberToNumber('abc')).toBe(undefined);
    expect(convertFormNumberToNumber('1.1.1')).toBe(undefined);
    expect(convertFormNumberToNumber('')).toBe(undefined);
  });
});

describe('convertNullishToEmptyStr', () => {
  test('null,undefinedは空文字', () => {
    expect(convertNullishToEmptyStr(undefined)).toBe('');
    expect(convertNullishToEmptyStr(null)).toBe('');
  });
  test('string型はそのまま返す', () => {
    expect(convertNullishToEmptyStr('')).toBe('');
    expect(convertNullishToEmptyStr('0')).toBe('0');
    expect(convertNullishToEmptyStr('a')).toBe('a');
  });
});

describe('getDuplicatePartsIndexList', () => {
  test('重複しているIndexを取得する', () => {
    const partRowList: Parts[] = [
      {
        level: 1,
        operatorId: 'opeid',
        amountRequired: 1,
        amountRequiredUnit: 'kilogram',
        partsName: 'Test1',
        supportPartsName: 'Test_s1',
        plantId: '1000000',
        terminatedFlag: false,
      },
      {
        level: 1,
        operatorId: 'opeid',
        amountRequired: 1,
        amountRequiredUnit: 'kilogram',
        partsName: 'Test_d1',
        supportPartsName: 'Test_sd1',
        plantId: '1000001',
        terminatedFlag: false,
      },
      {
        level: 1,
        operatorId: 'opeid',
        amountRequired: 1,
        amountRequiredUnit: 'kilogram',
        partsName: 'Test2',
        supportPartsName: 'Test_s1',
        plantId: '1000000',
        terminatedFlag: false,
      },
      {
        level: 1,
        operatorId: 'opeid',
        amountRequired: 1,
        amountRequiredUnit: 'kilogram',
        partsName: 'Test3',
        supportPartsName: 'Test_s3',
        plantId: '1000000',
        terminatedFlag: false,
      },

      {
        level: 1,
        operatorId: 'opeid',
        amountRequired: 1,
        amountRequiredUnit: 'kilogram',
        partsName: 'Test_d2',
        supportPartsName: 'Test_sd2',
        plantId: '1000002',
        terminatedFlag: false,
      },
      {
        level: 1,
        operatorId: 'opeid',
        amountRequired: 1,
        amountRequiredUnit: 'kilogram',
        partsName: 'Test_d1',
        supportPartsName: 'Test_sd1',
        plantId: '1000001',
        terminatedFlag: false,
      },
      {
        level: 1,
        operatorId: 'opeid',
        amountRequired: 1,
        amountRequiredUnit: 'kilogram',
        partsName: 'Test4',
        supportPartsName: 'Test_s4',
        plantId: '1000000',
        terminatedFlag: false,
      },
      {
        level: 1,
        operatorId: 'opeid',
        amountRequired: 1,
        amountRequiredUnit: 'kilogram',
        partsName: 'Test_d2',
        supportPartsName: 'Test_sd2',
        plantId: '1000002',
        terminatedFlag: false,
      },
      {
        level: 1,
        operatorId: 'opeid',
        amountRequired: 1,
        amountRequiredUnit: 'kilogram',
        partsName: 'Test_d1',
        supportPartsName: 'Test_sd1',
        plantId: '1000001',
        terminatedFlag: false,
      },
      {
        level: 1,
        operatorId: 'opeid',
        amountRequired: 1,
        amountRequiredUnit: 'kilogram',
        partsName: 'Test_d2',
        supportPartsName: 'Test_sd2',
        plantId: '1000002',
        terminatedFlag: false,
      },
    ];

    expect(getDuplicatePartsIndexList(partRowList)).toEqual([
      [1, 5, 8],
      [4, 7, 9],
    ]);
  });
});

describe('getDuplicateMessage', () => {
  test('重複している構成部品のエラーメッセージを取得する', () => {
    const partRowList: Parts[] = [
      {
        level: 1,
        operatorId: 'opeid',
        amountRequired: 1,
        amountRequiredUnit: 'kilogram',
        partsName: 'Test_d1',
        supportPartsName: 'Test_sd1',
        plantId: '1000001',
        terminatedFlag: false,
      },
      {
        level: 1,
        operatorId: 'opeid',
        amountRequired: 1,
        amountRequiredUnit: 'kilogram',
        partsName: 'Test_d1',
        supportPartsName: 'Test_sd1',
        plantId: '1000001',
        terminatedFlag: false,
      },
      {
        level: 1,
        operatorId: 'opeid',
        amountRequired: 1,
        amountRequiredUnit: 'kilogram',
        partsName: 'Test2',
        supportPartsName: 'Test_s1',
        plantId: '1000000',
        terminatedFlag: false,
      },
      {
        level: 1,
        operatorId: 'opeid',
        amountRequired: 1,
        amountRequiredUnit: 'kilogram',
        partsName: 'Test3',
        supportPartsName: 'Test_s3',
        plantId: '1000000',
        terminatedFlag: false,
      },

      {
        level: 1,
        operatorId: 'opeid',
        amountRequired: 1,
        amountRequiredUnit: 'kilogram',
        partsName: 'Test_d2',
        supportPartsName: 'Test_sd2',
        plantId: '1000002',
        terminatedFlag: false,
      },
      {
        level: 1,
        operatorId: 'opeid',
        amountRequired: 1,
        amountRequiredUnit: 'kilogram',
        partsName: 'Test_d1',
        supportPartsName: 'Test_sd1',
        plantId: '1000001',
        terminatedFlag: false,
      },
      {
        level: 1,
        operatorId: 'opeid',
        amountRequired: 1,
        amountRequiredUnit: 'kilogram',
        partsName: 'Test4',
        supportPartsName: 'Test_s4',
        plantId: '1000000',
        terminatedFlag: false,
      },
      {
        level: 1,
        operatorId: 'opeid',
        amountRequired: 1,
        amountRequiredUnit: 'kilogram',
        partsName: 'Test_d2',
        supportPartsName: 'Test_sd2',
        plantId: '1000002',
        terminatedFlag: false,
      },
      {
        level: 1,
        operatorId: 'opeid',
        amountRequired: 1,
        amountRequiredUnit: 'kilogram',
        partsName: 'Test_d1',
        supportPartsName: 'Test_sd1',
        plantId: '1000001',
        terminatedFlag: false,
      },
      {
        level: 1,
        operatorId: 'opeid',
        amountRequired: 1,
        amountRequiredUnit: 'kilogram',
        partsName: 'Test_d2',
        supportPartsName: 'Test_sd2',
        plantId: '1000002',
        terminatedFlag: false,
      },
    ];
    const plants: Plant[] = [
      {
        plantId: '1000000',
        openPlantId: '10000001',
        plantName: 'test_p0',
      },
      {
        plantId: '1000001',
        openPlantId: '10000011',
        plantName: 'test_p1',
      },
      {
        plantId: '1000002',
        openPlantId: '10000021',
        plantName: 'test_p2',
      },
    ];

    expect(getDuplicateMessage([0, 1, 5, 8], partRowList, plants)).toBe(
      '親部品と構成部品の1行目と5行目と8行目が重複しています。（Test_d1・Test_sd1・test_p1,10000011）'
    );
  });
});

describe('validatePartsDuplication', () => {
  const parentPartsA: Parts = {
    level: 1,
    partsName: 'nameA',
    supportPartsName: 'supNameA',
    amountRequired: 1,
    amountRequiredUnit: 'kilogram',
    operatorId: 'o',
    plantId: 'plantIdA',
    terminatedFlag: true,
    traceId: 't',
  };
  const childPartsA: Parts = {
    level: 2,
    partsName: 'nameA',
    supportPartsName: 'supNameA',
    amountRequired: 2,
    amountRequiredUnit: 'unit',
    operatorId: 'oo',
    plantId: 'plantIdA',
    terminatedFlag: false,
    traceId: 'tt',
  };

  const childPartsB: Parts = {
    level: 1,
    partsName: 'nameB',
    supportPartsName: 'supNameB',
    amountRequired: 2,
    amountRequiredUnit: 'unit',
    operatorId: 'o',
    plantId: 'plantIdB',
    terminatedFlag: false,
    traceId: 't',
  };
  const plants: Plant[] = [
    {
      plantName: '事業所A',
      plantId: 'plantIdA',
      plantAddress: 'AAA',
      openPlantId: 'openA',
      globalPlantId: 'globalA',
    },
    {
      plantName: '事業所B',
      plantId: 'plantIdB',
      plantAddress: 'BBB',
      openPlantId: 'openB',
    },
  ];
  test('重複している部品がある場合エラーメッセージを返す', () => {
    expect(
      validatePartsDuplication(
        {
          parentParts: parentPartsA,
          childrenParts: [childPartsA, childPartsB, childPartsA, childPartsB],
        },
        plants
      )
    ).toBe(
      '親部品と構成部品の1行目と3行目が重複しています。（nameA・supNameA・事業所A,openA）\n' +
      '構成部品の2行目と4行目が重複しています。（nameB・supNameB・事業所B,openB）'
    );
  });
  test('重複している部品がない場合undefinedを返す', () => {
    expect(
      validatePartsDuplication(
        {
          parentParts: parentPartsA,
          childrenParts: [childPartsB],
        },
        plants
      )
    ).toBe(undefined);
  });
});
