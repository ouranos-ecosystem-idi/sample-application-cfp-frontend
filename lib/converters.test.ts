import {
  PartsFormType,
  Plant,
  CertificationDataType,
  PartsStructure,
  PartsWithCfpDataType,
  TradeResponseDataType,
  TradeStatus,
} from '@/lib/types';
import {
  convertPartsStructureModelToPartsStructure,
  convertPartsDataAndTradeModelToTradeRequestDataType,
  convertCfpRequestFormRowTypeToTradeRequestModel,
  convertPartsModelToPartsWithoutLevel,
  convertNotificationModelToNotificationDataType,
  convertNotificationModelListToNotificationDataTypeList,
  convertPartsDataListAndCfpModelListToPartsWithCfpDataList,
  convertOperatorModelToOperator,
  convertTradeResponseModelListToTradeResponseDataTypeList,
  convertTradeResponseModelToTradeResponseDataType,
  convertTradeResponseDataTypeToRejectStatusModel,
  convertPlantModelToPlant,
  convertPartsWithCfpToCfpModel,
  convertPlantToPlantModel,
  convertCfpCertificationModelToCfpCertification,
  convertPartsModelToParts,
  convertPartsFormTypeToPartsStructure,
  convertPartsToPartsModel,
  convertPartsStructureToPartsStructureModel,
  convertStatusModelToTradeStatus,
  convertTradeStatusToStatusModel,
} from './converters';
import {
  Parts,
  TradeRequestDataType,
} from './types';
import { CfpRequestFormRowType } from '@/components/organisms/CfpRequestTable';
import {
  PartsModel,
  PartsStructureModel,
  StatusModel,
  TradeModel,
  CfpModel,
  TradeResponseModel,
  OperatorModel,
  CfpCertificationModel,
} from '@/api/models/dataTransport';
import { NotificationModel } from '@/api/models/traceability';

describe('convertPartsModelToParts', () => {
  test('変換の確認 (traceIdあり)', () => {
    const model: PartsModel = {
      amountRequired: 111,
      amountRequiredUnit: 'kilogram',
      operatorId: 'aaa2',
      partsName: 'aaa3',
      plantId: 'aaa4',
      supportPartsName: 'aaa5',
      terminatedFlag: true,
      traceId: 'trace-1',
    };
    expect(convertPartsModelToPartsWithoutLevel(model)).toEqual({
      amountRequired: 111,
      amountRequiredUnit: 'kilogram',
      operatorId: 'aaa2',
      partsName: 'aaa3',
      plantId: 'aaa4',
      supportPartsName: 'aaa5',
      terminatedFlag: true,
      traceId: 'trace-1',
    });
  });
  test('変換の確認 (traceIdなし)', () => {
    const model: PartsModel = {
      amountRequired: 111,
      amountRequiredUnit: null,
      operatorId: 'aaa2',
      partsName: null,
      plantId: 'aaa4',
      supportPartsName: null,
      terminatedFlag: true,
      traceId: null,
    };
    expect(convertPartsModelToPartsWithoutLevel(model)).toEqual({
      amountRequired: 111,
      amountRequiredUnit: undefined,
      operatorId: 'aaa2',
      partsName: '',
      plantId: 'aaa4',
      supportPartsName: '',
      terminatedFlag: true,
      traceId: undefined,
    });
  });
});

describe('convertPartsModelToParts', () => {
  test('traceIdの変換の確認', () => {
    const res1: PartsModel = {
      amountRequired: 111,
      amountRequiredUnit: 'kilogram',
      operatorId: 'aaa2',
      partsName: 'aaa3',
      plantId: 'aaa4',
      supportPartsName: 'aaa5',
      terminatedFlag: true,
      traceId: null,
    };
    const res2: PartsModel = {
      amountRequired: 222,
      amountRequiredUnit: 'unit',
      operatorId: 'bbb2',
      partsName: 'bbb3',
      plantId: 'bbb4',
      supportPartsName: 'bbb5',
      terminatedFlag: true,
      traceId: 'bbb6',
    };
    expect(convertPartsModelToParts(res1, 1)).toEqual({
      amountRequired: 111,
      amountRequiredUnit: 'kilogram',
      operatorId: 'aaa2',
      partsName: 'aaa3',
      plantId: 'aaa4',
      supportPartsName: 'aaa5',
      terminatedFlag: true,
      traceId: undefined,
      level: 1,
    });
    expect(convertPartsModelToParts(res2, 2)).toEqual({
      amountRequired: 222,
      amountRequiredUnit: 'unit',
      operatorId: 'bbb2',
      partsName: 'bbb3',
      plantId: 'bbb4',
      supportPartsName: 'bbb5',
      terminatedFlag: true,
      traceId: 'bbb6',
      level: 2,
    });
  });
});

describe('convertPartsStructureModelToPartsStructure', () => {
  const partsStructure: PartsStructureModel = {
    parentPartsModel: {
      amountRequired: 111,
      amountRequiredUnit: 'kilogram',
      operatorId: 'aaa2',
      partsName: 'aaa3',
      plantId: 'aaa4',
      supportPartsName: 'aaa5',
      terminatedFlag: true,
      traceId: null,
    },
    childrenPartsModel: [
      {
        amountRequired: 111,
        amountRequiredUnit: 'kilogram',
        operatorId: 'aaa2',
        partsName: 'aaa3',
        plantId: 'aaa4',
        supportPartsName: 'aaa5',
        terminatedFlag: true,
        traceId: null,
      },
      {
        amountRequired: 222,
        amountRequiredUnit: 'unit',
        operatorId: 'bbb2',
        partsName: 'bbb3',
        plantId: 'bbb4',
        supportPartsName: 'bbb5',
        terminatedFlag: true,
        traceId: 'bbb6',
      },
    ],
  };

  test('変換の確認', () => {
    expect(
      convertPartsStructureModelToPartsStructure(partsStructure)
    ).toStrictEqual({
      parentParts: {
        amountRequired: 111,
        amountRequiredUnit: 'kilogram',
        operatorId: 'aaa2',
        partsName: 'aaa3',
        plantId: 'aaa4',
        supportPartsName: 'aaa5',
        terminatedFlag: true,
        traceId: undefined,
        level: 1,
      },
      childrenParts: [
        {
          amountRequired: 111,
          amountRequiredUnit: 'kilogram',
          operatorId: 'aaa2',
          partsName: 'aaa3',
          plantId: 'aaa4',
          supportPartsName: 'aaa5',
          terminatedFlag: true,
          traceId: undefined,
          level: 2,
        },
        {
          amountRequired: 222,
          amountRequiredUnit: 'unit',
          operatorId: 'bbb2',
          partsName: 'bbb3',
          plantId: 'bbb4',
          supportPartsName: 'bbb5',
          terminatedFlag: true,
          traceId: 'bbb6',
          level: 2,
        },
      ],
    });
  });
});

describe('convertPartsFormTypeToPartsStructure', () => {
  const partsRegisterForm: PartsFormType = {
    parentParts: {
      // 数値のケース
      amountRequired: '',
      amountRequiredUnit: '',
      partsName: 'aaa1',
      plantId: 'aaa2',
      supportPartsName: 'aaa3',
      terminatedFlag: false,
    },
    childrenParts: [
      {
        // 文字列のケース
        amountRequired: '222',
        amountRequiredUnit: 'unit',
        partsName: 'bbb1',
        plantId: 'bbb2',
        supportPartsName: 'bbb3',
        terminatedFlag: true,
      },
      {
        amountRequired: 333,
        amountRequiredUnit: 'kilogram',
        partsName: 'ccc1',
        plantId: 'ccc2',
        supportPartsName: 'ccc3',
        terminatedFlag: false,
        traceId: 'aaa',
      },
    ],
  };

  test('変換の確認', () => {
    expect(
      convertPartsFormTypeToPartsStructure(partsRegisterForm, 'opid')
    ).toEqual({
      parentParts: {
        level: 1,
        amountRequired: null, // 親の活動量は必ずnull
        amountRequiredUnit: undefined,
        partsName: 'aaa1',
        plantId: 'aaa2',
        supportPartsName: 'aaa3',
        terminatedFlag: false,
        traceId: undefined,
        operatorId: 'opid',
      },
      childrenParts: [
        {
          level: 2,
          // 数値に変換される
          amountRequired: 222,
          amountRequiredUnit: 'unit',
          partsName: 'bbb1',
          plantId: 'bbb2',
          supportPartsName: 'bbb3',
          terminatedFlag: true,
          traceId: undefined,
          operatorId: 'opid',
        },
        {
          level: 2,
          amountRequired: 333,
          amountRequiredUnit: 'kilogram',
          partsName: 'ccc1',
          plantId: 'ccc2',
          supportPartsName: 'ccc3',
          terminatedFlag: false,
          traceId: 'aaa',
          operatorId: 'opid',
        },
      ],
    });
  });
});

describe('convertPartsToPartsModel', () => {
  const parts: Parts = {
    level: 2,
    amountRequired: 1.1,
    amountRequiredUnit: undefined,
    partsName: 'aaa1',
    plantId: 'aaa2',
    supportPartsName: 'aaa3',
    terminatedFlag: false,
    operatorId: 'opeid',
  };

  test('変換の確認', () => {
    expect(convertPartsToPartsModel(parts)).toEqual({
      amountRequired: 1.1,
      amountRequiredUnit: null,
      partsName: 'aaa1',
      plantId: 'aaa2',
      supportPartsName: 'aaa3',
      terminatedFlag: false,
      traceId: null,
      operatorId: 'opeid',
    });
  });
});

describe('convertPartsStructureToPartsStructureModel', () => {
  const partsStructure: PartsStructure = {
    parentParts: {
      level: 1,
      amountRequired: 111,
      amountRequiredUnit: 'kilogram',
      operatorId: 'aaa2',
      partsName: 'aaa3',
      plantId: 'aaa4',
      supportPartsName: 'aaa5',
      terminatedFlag: true,
      traceId: undefined,
    },
    childrenParts: [
      {
        level: 2,
        amountRequired: 111,
        amountRequiredUnit: 'kilogram',
        operatorId: 'aaa2',
        partsName: 'aaa3',
        plantId: 'aaa4',
        supportPartsName: 'aaa5',
        terminatedFlag: true,
        traceId: 'tid',
      },
      {
        level: 2,
        amountRequired: 222,
        amountRequiredUnit: 'unit',
        operatorId: 'bbb2',
        partsName: 'bbb3',
        plantId: 'bbb4',
        supportPartsName: 'bbb5',
        terminatedFlag: true,
        traceId: 'bbb6',
      },
    ],
  };

  test('変換の確認', () => {
    expect(convertPartsStructureToPartsStructureModel(partsStructure)).toEqual({
      parentPartsModel: {
        amountRequired: null,
        amountRequiredUnit: 'kilogram',
        operatorId: 'aaa2',
        partsName: 'aaa3',
        plantId: 'aaa4',
        supportPartsName: 'aaa5',
        terminatedFlag: true,
        traceId: null,
      },
      childrenPartsModel: [
        {
          amountRequired: 111,
          amountRequiredUnit: 'kilogram',
          operatorId: 'aaa2',
          partsName: 'aaa3',
          plantId: 'aaa4',
          supportPartsName: 'aaa5',
          terminatedFlag: true,
          traceId: 'tid',
        },
        {
          amountRequired: 222,
          amountRequiredUnit: 'unit',
          operatorId: 'bbb2',
          partsName: 'bbb3',
          plantId: 'bbb4',
          supportPartsName: 'bbb5',
          terminatedFlag: true,
          traceId: 'bbb6',
        },
      ],
    });
  });
});

describe('convertPartsDataAndTradeModelToTradeRequestDataType', () => {
  test('変換の確認', () => {
    const parts: Parts[] = [
      {
        amountRequired: 111,
        amountRequiredUnit: 'kilogram',
        operatorId: 'aaa2',
        partsName: 'aaa3',
        plantId: 'aaa4',
        supportPartsName: 'aaa5',
        terminatedFlag: true,
        traceId: 'aaa6',
        level: 1,
      },
      {
        amountRequired: 222,
        amountRequiredUnit: 'unit',
        operatorId: 'bbb2',
        partsName: 'bbb3',
        plantId: 'bbb4',
        supportPartsName: 'bbb5',
        terminatedFlag: true,
        traceId: 'bbb6',
        level: 2,
      },
    ];
    const trade: TradeModel[] = [
      {
        downstreamOperatorId: 'aaa2',
        downstreamTraceId: 'aaa6',
        tradeId: 'ccc',
        upstreamOperatorId: 'ddd',
        upstreamTraceId: '',
      },
    ];

    expect(
      convertPartsDataAndTradeModelToTradeRequestDataType(parts, trade)
    ).toStrictEqual([
      {
        downStreamPart: {
          amountRequired: 111,
          amountRequiredUnit: 'kilogram',
          operatorId: 'aaa2',
          partsName: 'aaa3',
          plantId: 'aaa4',
          supportPartsName: 'aaa5',
          terminatedFlag: true,
          traceId: 'aaa6',
          level: 1,
        },
        tradeId: 'ccc',
        upstreamOperatorId: 'ddd',
      },
      {
        downStreamPart: {
          amountRequired: 222,
          amountRequiredUnit: 'unit',
          operatorId: 'bbb2',
          partsName: 'bbb3',
          plantId: 'bbb4',
          supportPartsName: 'bbb5',
          terminatedFlag: true,
          traceId: 'bbb6',
          level: 2,
        },
        tradeId: '',
        upstreamOperatorId: undefined,
      },
    ]);
  });
});

describe('convertPartsDataAndTradeResponseModelToTradeResponseDataTypeList', () => {
  test('変換の確認', () => {
    const tradeResponseData: TradeResponseModel[] = [
      {
        tradeModel: {
          downstreamOperatorId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
          downstreamTraceId: 'd9a38406-cae2-4679-b052-15a75f5531e9',
          tradeId: 'd9a38406-cae2-4679-b052-15a75f5531e6',
          upstreamOperatorId: 'd9a38406-cae2-4679-b052-15a75f5531e8',
          upstreamTraceId: 'd9a38406-cae2-4679-b052-15a75f5531f0',
        },
        statusModel: {
          message: '回答依頼時のメッセージが入ります',
          replyMessage: null,
          requestStatus: {
            cfpResponseStatus: 'NOT_COMPLETED',
            tradeTreeStatus: 'TERMINATED',
          },
          requestType: 'CFP',
          statusId: 'd9a38406-cae2-4679-b052-15a75f553c01',
          tradeId: 'd9a38406-cae2-4679-b052-15a75f5531e6',
        },
        partsModel: {
          amountRequired: null,
          amountRequiredUnit: 'kilogram',
          operatorId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
          partsName: 'PartsA-002123',
          plantId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
          supportPartsName: null,
          terminatedFlag: false,
          traceId: 'd9a38406-cae2-4679-b052-15a75f5531e9',
        },
      },
      {
        tradeModel: {
          downstreamOperatorId: 'd9a38406-cae2-4679-b052-15a75f5531e8',
          downstreamTraceId: 'd9a38406-cae2-4679-b052-15a75f5531e8',
          tradeId: 'd9a38406-cae2-4679-b052-15a75f5531e8',
          upstreamOperatorId: 'd9a38406-cae2-4679-b052-15a75f5531e9',
          upstreamTraceId: null,
        },
        statusModel: {
          message: '回答依頼時のメッセージが入ります',
          replyMessage: null,
          requestStatus: {
            cfpResponseStatus: 'COMPLETED',
            tradeTreeStatus: 'TERMINATED',
          },
          requestType: 'CFP',
          statusId: 'd9a38406-cae2-4679-b052-15a75f553c01',
          tradeId: 'd9a38406-cae2-4679-b052-15a75f5531e9',
        },
        partsModel: {
          amountRequired: null,
          amountRequiredUnit: 'kilogram',
          operatorId: 'd9a38406-cae2-4679-b052-15a75f5532e9',
          partsName: 'PartsA-002123',
          plantId: 'd9a38406-cae2-4679-b052-15a75f5537e1',
          supportPartsName: null,
          terminatedFlag: false,
          traceId: 'd9a38406-cae2-4679-b052-15a75f5532e9',
        },
      },
    ];

    expect(
      convertTradeResponseModelListToTradeResponseDataTypeList(
        tradeResponseData
      )
    ).toStrictEqual([
      {
        downstreamOperatorId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
        downstreamTraceId: 'd9a38406-cae2-4679-b052-15a75f5531e9',
        tradeId: 'd9a38406-cae2-4679-b052-15a75f5531e6',
        status: 'incomplete',
        message: '回答依頼時のメッセージが入ります',
        upstreamTraceId: 'd9a38406-cae2-4679-b052-15a75f5531f0',
        replyMessage: undefined,
        statusId: 'd9a38406-cae2-4679-b052-15a75f553c01',
        downstreamPart: {
          amountRequired: null,
          amountRequiredUnit: 'kilogram',
          operatorId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
          partsName: 'PartsA-002123',
          plantId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
          supportPartsName: '',
          terminatedFlag: false,
          traceId: 'd9a38406-cae2-4679-b052-15a75f5531e9',
        },
        tradeTreeStatus: 'TERMINATED',
      },
      {
        downstreamOperatorId: 'd9a38406-cae2-4679-b052-15a75f5531e8',
        downstreamTraceId: 'd9a38406-cae2-4679-b052-15a75f5531e8',
        tradeId: 'd9a38406-cae2-4679-b052-15a75f5531e8',
        status: 'sent',
        message: '回答依頼時のメッセージが入ります',
        replyMessage: undefined,
        statusId: 'd9a38406-cae2-4679-b052-15a75f553c01',
        upstreamTraceId: undefined,
        downstreamPart: {
          amountRequired: null,
          amountRequiredUnit: 'kilogram',
          operatorId: 'd9a38406-cae2-4679-b052-15a75f5532e9',
          partsName: 'PartsA-002123',
          plantId: 'd9a38406-cae2-4679-b052-15a75f5537e1',
          supportPartsName: '',
          terminatedFlag: false,
          traceId: 'd9a38406-cae2-4679-b052-15a75f5532e9',
        },
        tradeTreeStatus: 'TERMINATED',
      },
    ]);
  });
  test('statusIdがnullの場合の確認', () => {
    const tradeResponseData: TradeResponseModel[] = [
      {
        tradeModel: {
          downstreamOperatorId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
          downstreamTraceId: 'd9a38406-cae2-4679-b052-15a75f5531e9',
          tradeId: null,
          upstreamOperatorId: 'd9a38406-cae2-4679-b052-15a75f5531e8',
          upstreamTraceId: 'd9a38406-cae2-4679-b052-15a75f5531f0',
        },
        statusModel: {
          message: null,
          replyMessage: null,
          requestStatus: {
            cfpResponseStatus: 'NOT_COMPLETED',
            tradeTreeStatus: 'TERMINATED',
          },
          requestType: 'CFP',
          statusId: null,
          tradeId: 'd9a38406-cae2-4679-b052-15a75f5531e6',
        },
        partsModel: {
          amountRequired: null,
          amountRequiredUnit: 'kilogram',
          operatorId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
          partsName: 'PartsA-002123',
          plantId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
          supportPartsName: null,
          terminatedFlag: false,
          traceId: null,
        },
      },
      {
        tradeModel: {
          downstreamOperatorId: 'd9a38406-cae2-4679-b052-15a75f5531e8',
          downstreamTraceId: 'd9a38406-cae2-4679-b052-15a75f5531e8',
          tradeId: null,
          upstreamOperatorId: 'd9a38406-cae2-4679-b052-15a75f5531e9',
          upstreamTraceId: null,
        },
        statusModel: {
          message: null,
          replyMessage: null,
          requestStatus: {
            cfpResponseStatus: 'COMPLETED',
            tradeTreeStatus: 'TERMINATED',
          },
          requestType: 'CFP',
          statusId: null,
          tradeId: 'd9a38406-cae2-4679-b052-15a75f5531e9',
        },
        partsModel: {
          amountRequired: null,
          amountRequiredUnit: 'kilogram',
          operatorId: 'd9a38406-cae2-4679-b052-15a75f5532e9',
          partsName: 'PartsA-002123',
          plantId: 'd9a38406-cae2-4679-b052-15a75f5537e1',
          supportPartsName: null,
          terminatedFlag: false,
          traceId: null,
        },
      },
    ];

    expect(
      convertTradeResponseModelListToTradeResponseDataTypeList(
        tradeResponseData
      )
    ).toStrictEqual([
      {
        downstreamOperatorId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
        downstreamTraceId: 'd9a38406-cae2-4679-b052-15a75f5531e9',
        tradeId: undefined,
        status: 'incomplete',
        message: undefined,
        upstreamTraceId: 'd9a38406-cae2-4679-b052-15a75f5531f0',
        replyMessage: undefined,
        statusId: undefined,
        downstreamPart: {
          amountRequired: null,
          amountRequiredUnit: 'kilogram',
          operatorId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
          partsName: 'PartsA-002123',
          plantId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
          supportPartsName: '',
          terminatedFlag: false,
          traceId: undefined,
        },
        tradeTreeStatus: 'TERMINATED',
      },
      {
        downstreamOperatorId: 'd9a38406-cae2-4679-b052-15a75f5531e8',
        downstreamTraceId: 'd9a38406-cae2-4679-b052-15a75f5531e8',
        tradeId: undefined,
        status: 'sent',
        message: undefined,
        replyMessage: undefined,
        statusId: undefined,
        upstreamTraceId: undefined,
        downstreamPart: {
          amountRequired: null,
          amountRequiredUnit: 'kilogram',
          operatorId: 'd9a38406-cae2-4679-b052-15a75f5532e9',
          partsName: 'PartsA-002123',
          plantId: 'd9a38406-cae2-4679-b052-15a75f5537e1',
          supportPartsName: '',
          terminatedFlag: false,
          traceId: undefined,
        },
        tradeTreeStatus: 'TERMINATED',
      },
    ]);
  });
});

describe('convertPartsDataAndTradeResponseModelToTradeResponseDataType', () => {
  const tradeResponseData: TradeResponseModel = {
    tradeModel: {
      downstreamOperatorId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
      downstreamTraceId: 'd9a38406-cae2-4679-b052-15a75f5531e9',
      tradeId: 'd9a38406-cae2-4679-b052-15a75f5531e6',
      upstreamOperatorId: 'd9a38406-cae2-4679-b052-15a75f5531e8',
      upstreamTraceId: 'd9a38406-cae2-4679-b052-15a75f5531f0',
    },
    statusModel: {
      message: '回答依頼時のメッセージが入ります',
      replyMessage: 'aaa',
      requestStatus: {
        cfpResponseStatus: 'NOT_COMPLETED',
        tradeTreeStatus: 'TERMINATED',
      },
      requestType: 'CFP',
      statusId: 'd9a38406-cae2-4679-b052-15a75f553c01',
      tradeId: 'd9a38406-cae2-4679-b052-15a75f5531e6',
    },
    partsModel: {
      amountRequired: null,
      amountRequiredUnit: 'kilogram',
      operatorId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
      partsName: 'PartsA-002123',
      plantId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
      supportPartsName: null,
      terminatedFlag: false,
      traceId: 'd9a38406-cae2-4679-b052-15a75f5531e9',
    },
  };

  const tradeResponseDataHasNull: TradeResponseModel = {
    tradeModel: {
      downstreamOperatorId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
      downstreamTraceId: 'd9a38406-cae2-4679-b052-15a75f5531e9',
      tradeId: null,
      upstreamOperatorId: 'd9a38406-cae2-4679-b052-15a75f5531e8',
      upstreamTraceId: null,
    },
    statusModel: {
      message: null,
      replyMessage: null,
      requestStatus: {
        cfpResponseStatus: 'NOT_COMPLETED',
        tradeTreeStatus: 'TERMINATED',
      },
      requestType: 'CFP',
      statusId: null,
      tradeId: 'd9a38406-cae2-4679-b052-15a75f5531e6',
    },
    partsModel: {
      amountRequired: null,
      amountRequiredUnit: 'kilogram',
      operatorId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
      partsName: 'PartsA-002123',
      plantId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
      supportPartsName: null,
      terminatedFlag: false,
      traceId: 'd9a38406-cae2-4679-b052-15a75f5531e9',
    },
  };

  test('変換の確認', () => {
    expect(
      convertTradeResponseModelToTradeResponseDataType(
        tradeResponseData
      )
    ).toStrictEqual({
      downstreamOperatorId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
      downstreamTraceId: 'd9a38406-cae2-4679-b052-15a75f5531e9',
      tradeId: 'd9a38406-cae2-4679-b052-15a75f5531e6',
      status: 'incomplete',
      statusId: 'd9a38406-cae2-4679-b052-15a75f553c01',
      message: '回答依頼時のメッセージが入ります',
      replyMessage: 'aaa',
      upstreamTraceId: 'd9a38406-cae2-4679-b052-15a75f5531f0',
      downstreamPart: {
        amountRequired: null,
        amountRequiredUnit: 'kilogram',
        operatorId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
        partsName: 'PartsA-002123',
        plantId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
        supportPartsName: '',
        terminatedFlag: false,
        traceId: 'd9a38406-cae2-4679-b052-15a75f5531e9',
      },
      tradeTreeStatus: 'TERMINATED',
    });
  });

  test('nullの値が存在する場合', () => {
    expect(
      convertTradeResponseModelToTradeResponseDataType(tradeResponseDataHasNull)
    ).toStrictEqual({
      downstreamOperatorId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
      downstreamTraceId: 'd9a38406-cae2-4679-b052-15a75f5531e9',
      tradeId: undefined,
      status: 'incomplete',
      statusId: undefined,
      message: undefined,
      replyMessage: undefined,
      upstreamTraceId: undefined,
      downstreamPart: {
        amountRequired: null,
        amountRequiredUnit: 'kilogram',
        operatorId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
        partsName: 'PartsA-002123',
        plantId: 'd9a38406-cae2-4679-b052-15a75f5531e7',
        supportPartsName: '',
        terminatedFlag: false,
        traceId: 'd9a38406-cae2-4679-b052-15a75f5531e9',
      },
      tradeTreeStatus: 'TERMINATED',
    });
  });
});

describe('convertCfpRequestFormRowTypeToTradeRequestModel', () => {
  test('変換の確認 1', () => {
    const form: CfpRequestFormRowType = {
      downstreamTraceId: 'aaa',
      upstreamOperatorId: 'aaa1',
      message: 'aaa2',
      selected: true,
      openOperatorId: 'openid',
      operatorName: 'openname',
    };

    expect(
      convertCfpRequestFormRowTypeToTradeRequestModel(form, 'ccc')
    ).toStrictEqual({
      statusModel: {
        message: 'aaa2',
        requestStatus: {},
        requestType: 'CFP',
        statusId: null,
        tradeId: null,
      },
      tradeModel: {
        downstreamOperatorId: 'ccc',
        downstreamTraceId: 'aaa',
        tradeId: null,
        upstreamOperatorId: 'aaa1',
        upstreamTraceId: null,
      },
    });
  });
});

describe('convertNotificationModelToNotificationDataType', () => {
  const notificationModel: NotificationModel = {
    notificationId: '1a0a51e8-d769-4b09-b75c-b97bd5dc5ab8',
    notificationType: 'REQUEST_NEW',
    notifiedFromOperatorId: 'a1234567-1234-1234-1234-123456789012',
    tradeRelation: {
      tradeId: '42e88a35-aa6d-4b1d-8e02-188d8efe8f0e',
      requestId: '2078964a-40e0-4824-8bdf-41a154c88179',
      downstreamOperatorId: 'a1234567-1234-1234-1234-123456789012',
      upstreamOperatorId: 'b1234567-1234-1234-1234-123456789012',
      downstreamTraceId: '94078880-cfc3-43db-931b-841064cf719a',
      upstreamTraceId: undefined,
    },
    notifiedAt: '2024-02-06T11:43:51Z',
  };
  test('変換の確認', () => {
    expect(
      convertNotificationModelToNotificationDataType(notificationModel)
    ).toStrictEqual({
      notificationId: '1a0a51e8-d769-4b09-b75c-b97bd5dc5ab8',
      notificationType: 'REQUEST_NEW',
      notifiedFromOperatorId: 'a1234567-1234-1234-1234-123456789012',
      tradeRelation: {
        tradeId: '42e88a35-aa6d-4b1d-8e02-188d8efe8f0e',
        requestId: '2078964a-40e0-4824-8bdf-41a154c88179',
        downstreamOperatorId: 'a1234567-1234-1234-1234-123456789012',
        upstreamOperatorId: 'b1234567-1234-1234-1234-123456789012',
        downstreamTraceId: '94078880-cfc3-43db-931b-841064cf719a',
        upstreamTraceId: undefined,
      },
      notifiedAt: new Date('2024-02-06T11:43:51Z'),
    });
  });
});

describe('convertNotificationModelListToNotificationDataTypeList', () => {
  const notificationModels: NotificationModel[] = [
    {
      notificationId: '1a0a51e8-d769-4b09-b75c-b97bd5dc5ab8',
      notificationType: 'REQUEST_NEW',
      notifiedFromOperatorId: 'a1234567-1234-1234-1234-123456789012',
      tradeRelation: {
        tradeId: '42e88a35-aa6d-4b1d-8e02-188d8efe8f0e',
        requestId: '2078964a-40e0-4824-8bdf-41a154c88179',
        downstreamOperatorId: 'a1234567-1234-1234-1234-123456789012',
        upstreamOperatorId: 'b1234567-1234-1234-1234-123456789012',
        downstreamTraceId: '94078880-cfc3-43db-931b-841064cf719a',
        upstreamTraceId: undefined,
      },
      notifiedAt: '2024-02-06T11:43:51Z',
    },
    {
      notificationId: '1a0a51e8-d769-4b09-b75c-b97bd5dc5ab8',
      notificationType: 'CFP_RESPONSED',
      notifiedFromOperatorId: 'a1234567-1234-1234-1234-123456789012',
      notifiedAt: '2024-02-06T11:43:51Z',
      tradeRelation: {
        tradeId: '42e88a35-aa6d-4b1d-8e02-188d8efe8f0e',
        requestId: '2078964a-40e0-4824-8bdf-41a154c88179',
        downstreamOperatorId: 'a1234567-1234-1234-1234-123456789012',
        upstreamOperatorId: 'b1234567-1234-1234-1234-123456789012',
        downstreamTraceId: '94078880-cfc3-43db-931b-841064cf719a',
        upstreamTraceId: '94078880-cfc3-43db-931b-841064cf719a',
      },
    },
  ];
  test('変換の確認', () => {
    expect(
      convertNotificationModelListToNotificationDataTypeList(notificationModels)
    ).toStrictEqual([
      {
        notificationId: '1a0a51e8-d769-4b09-b75c-b97bd5dc5ab8',
        notificationType: 'REQUEST_NEW',
        notifiedFromOperatorId: 'a1234567-1234-1234-1234-123456789012',
        notifiedAt: new Date('2024-02-06T11:43:51Z'),
        tradeRelation: {
          tradeId: '42e88a35-aa6d-4b1d-8e02-188d8efe8f0e',
          requestId: '2078964a-40e0-4824-8bdf-41a154c88179',
          downstreamOperatorId: 'a1234567-1234-1234-1234-123456789012',
          upstreamOperatorId: 'b1234567-1234-1234-1234-123456789012',
          downstreamTraceId: '94078880-cfc3-43db-931b-841064cf719a',
          upstreamTraceId: undefined,
        },
      },
      {
        notificationId: '1a0a51e8-d769-4b09-b75c-b97bd5dc5ab8',
        notificationType: 'CFP_RESPONSED',
        notifiedFromOperatorId: 'a1234567-1234-1234-1234-123456789012',
        tradeRelation: {
          tradeId: '42e88a35-aa6d-4b1d-8e02-188d8efe8f0e',
          requestId: '2078964a-40e0-4824-8bdf-41a154c88179',
          downstreamOperatorId: 'a1234567-1234-1234-1234-123456789012',
          upstreamOperatorId: 'b1234567-1234-1234-1234-123456789012',
          downstreamTraceId: '94078880-cfc3-43db-931b-841064cf719a',
          upstreamTraceId: '94078880-cfc3-43db-931b-841064cf719a',
        },
        notifiedAt: new Date('2024-02-06T11:43:51Z'),
      },
    ]);
  });
});

describe('convertPartsDataListAndCfpModelListToPartsWithCfpDataList', () => {
  const partsList: Parts[] = [
    {
      traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
      operatorId: 'f650e73e-4aad-3900-fd34-355077b5a34d',
      plantId: '591bb86e-19c4-4b36-bf72-a80a2d26ce0a',
      partsName: 'Test-002',
      supportPartsName: 'Supp-002',
      terminatedFlag: true,
      amountRequired: 1,
      amountRequiredUnit: 'kilogram',
      level: 2,
    },
    {
      traceId: 'd81f7656-fdc2-470d-bd13-e6ce95d2cd6a',
      operatorId: 'f650e73e-4aad-3900-fd34-355077b5a34d',
      plantId: '591bb86e-19c4-4b36-bf72-a80a2d26ce0a',
      partsName: 'Test-001',
      supportPartsName: 'Supp-001',
      terminatedFlag: false,
      amountRequired: 0.5,
      amountRequiredUnit: 'kilogram',
      level: 2,
    },
  ];

  const cfpModelList: CfpModel[] = [
    {
      cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
      traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
      ghgEmission: 0,
      ghgDeclaredUnit: 'kgCO2e/kilogram',
      cfpType: 'mainProductionTotal',
      dqrType: 'mainProcessingTotal',
      dqrValue: {
        TeR: 4.4,
        GeR: 4.5,
        TiR: 4.6,
      },
    },
    {
      cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
      traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
      ghgEmission: 0,
      ghgDeclaredUnit: 'kgCO2e/kilogram',
      cfpType: 'preComponentTotal',
      dqrType: 'preProcessingTotal',
      dqrValue: {
        TeR: 4.1,
        GeR: 4.2,
        TiR: 4.3,
      },
    },
    {
      cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
      traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
      ghgEmission: 0,
      ghgDeclaredUnit: 'kgCO2e/kilogram',
      cfpType: 'mainComponentTotal',
      dqrType: 'mainProcessingTotal',
      dqrValue: {
        TeR: 4.4,
        GeR: 4.5,
        TiR: 4.6,
      },
    },
    {
      cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
      traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
      ghgEmission: 0,
      ghgDeclaredUnit: 'kgCO2e/kilogram',
      cfpType: 'preProduction',
      dqrType: 'preProcessing',
      dqrValue: {
        TeR: 0,
        GeR: 0,
        TiR: 0,
      },
    },
    {
      cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
      traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
      ghgEmission: 0,
      ghgDeclaredUnit: 'kgCO2e/kilogram',
      cfpType: 'mainProduction',
      dqrType: 'mainProcessing',
      dqrValue: {
        TeR: 3.1,
        GeR: 3.2,
        TiR: 3.3,
      },
    },
    {
      cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
      traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
      ghgEmission: 3.3,
      ghgDeclaredUnit: 'kgCO2e/kilogram',
      cfpType: 'preComponent',
      dqrType: 'preProcessing',
      dqrValue: {
        TeR: 0,
        GeR: 0,
        TiR: 0,
      },
    },
    {
      cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
      traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
      ghgEmission: 4.4,
      ghgDeclaredUnit: 'kgCO2e/kilogram',
      cfpType: 'mainComponent',
      dqrType: 'mainProcessing',
      dqrValue: {
        TeR: 3.1,
        GeR: 3.2,
        TiR: 3.3,
      },
    },
    {
      cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
      traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
      ghgEmission: 0,
      ghgDeclaredUnit: 'kgCO2e/kilogram',
      cfpType: 'preProductionTotal',
      dqrType: 'preProcessingTotal',
      dqrValue: {
        TeR: 4.1,
        GeR: 4.2,
        TiR: 4.3,
      },
    },
  ];
  const cfpModelListWithNullCfpIdAndGhgEmission: CfpModel[] = [
    {
      cfpId: null,
      traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
      ghgEmission: null,
      ghgDeclaredUnit: 'kgCO2e/kilogram',
      cfpType: 'mainProductionTotal',
      dqrType: 'mainProcessingTotal',
      dqrValue: {
        TeR: null,
        GeR: null,
        TiR: null,
      },
    },
    {
      cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
      traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
      ghgEmission: 0,
      ghgDeclaredUnit: 'kgCO2e/kilogram',
      cfpType: 'preComponentTotal',
      dqrType: 'preProcessingTotal',
      dqrValue: {
        TeR: 4.1,
        GeR: 4.2,
        TiR: 4.3,
      },
    },
    {
      cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
      traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
      ghgEmission: 0,
      ghgDeclaredUnit: 'kgCO2e/kilogram',
      cfpType: 'mainComponentTotal',
      dqrType: 'mainProcessingTotal',
      dqrValue: {
        TeR: 4.4,
        GeR: 4.5,
        TiR: 4.6,
      },
    },
    {
      cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
      traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
      ghgEmission: 0,
      ghgDeclaredUnit: 'kgCO2e/kilogram',
      cfpType: 'preProduction',
      dqrType: 'preProcessing',
      dqrValue: {
        TeR: 0,
        GeR: 0,
        TiR: 0,
      },
    },
    {
      cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
      traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
      ghgEmission: 0,
      ghgDeclaredUnit: 'kgCO2e/kilogram',
      cfpType: 'mainProduction',
      dqrType: 'mainProcessing',
      dqrValue: {
        TeR: 3.1,
        GeR: 3.2,
        TiR: 3.3,
      },
    },
    {
      cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
      traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
      ghgEmission: 3.3,
      ghgDeclaredUnit: 'kgCO2e/kilogram',
      cfpType: 'preComponent',
      dqrType: 'preProcessing',
      dqrValue: {
        TeR: 0,
        GeR: 0,
        TiR: 0,
      },
    },
    {
      cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
      traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
      ghgEmission: 4.4,
      ghgDeclaredUnit: 'kgCO2e/kilogram',
      cfpType: 'mainComponent',
      dqrType: 'mainProcessing',
      dqrValue: {
        TeR: 3.1,
        GeR: 3.2,
        TiR: 3.3,
      },
    },
    {
      cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
      traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
      ghgEmission: 0,
      ghgDeclaredUnit: 'kgCO2e/kilogram',
      cfpType: 'preProductionTotal',
      dqrType: 'preProcessingTotal',
      dqrValue: {
        TeR: 4.1,
        GeR: 4.2,
        TiR: 4.3,
      },
    },
  ];

  test('変換の確認', () => {
    expect(
      convertPartsDataListAndCfpModelListToPartsWithCfpDataList(
        partsList,
        cfpModelList
      )
    ).toStrictEqual([
      {
        parts: {
          traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
          operatorId: 'f650e73e-4aad-3900-fd34-355077b5a34d',
          plantId: '591bb86e-19c4-4b36-bf72-a80a2d26ce0a',
          partsName: 'Test-002',
          supportPartsName: 'Supp-002',
          terminatedFlag: true,
          amountRequired: 1,
          amountRequiredUnit: 'kilogram',
          level: 2,
        },
        cfps: {
          mainProductionTotal: {
            cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
            emission: 0,
            unit: 'kgCO2e/kilogram',
            traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
            dqrType: 'mainProcessingTotal',
            dqrValue: {
              TeR: 4.4,
              GeR: 4.5,
              TiR: 4.6,
            },
          },
          preComponentTotal: {
            cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
            emission: 0,
            unit: 'kgCO2e/kilogram',
            traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
            dqrType: 'preProcessingTotal',
            dqrValue: {
              TeR: 4.1,
              GeR: 4.2,
              TiR: 4.3,
            },
          },
          mainComponentTotal: {
            cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
            emission: 0,
            unit: 'kgCO2e/kilogram',
            traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
            dqrType: 'mainProcessingTotal',
            dqrValue: {
              TeR: 4.4,
              GeR: 4.5,
              TiR: 4.6,
            },
          },
          preProduction: {
            cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
            emission: 0,
            unit: 'kgCO2e/kilogram',
            traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
            dqrType: 'preProcessing',
            dqrValue: {
              TeR: 0,
              GeR: 0,
              TiR: 0,
            },
          },
          mainProduction: {
            cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
            emission: 0,
            unit: 'kgCO2e/kilogram',
            traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
            dqrType: 'mainProcessing',
            dqrValue: {
              TeR: 3.1,
              GeR: 3.2,
              TiR: 3.3,
            },
          },
          preComponent: {
            cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
            emission: 3.3,
            unit: 'kgCO2e/kilogram',
            traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
            dqrType: 'preProcessing',
            dqrValue: {
              TeR: 0,
              GeR: 0,
              TiR: 0,
            },
          },
          mainComponent: {
            cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
            emission: 4.4,
            unit: 'kgCO2e/kilogram',
            traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
            dqrType: 'mainProcessing',
            dqrValue: {
              TeR: 3.1,
              GeR: 3.2,
              TiR: 3.3,
            },
          },
          preProductionTotal: {
            cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
            emission: 0,
            unit: 'kgCO2e/kilogram',
            traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
            dqrType: 'preProcessingTotal',
            dqrValue: {
              TeR: 4.1,
              GeR: 4.2,
              TiR: 4.3,
            },
          },
        },
      },
      {
        parts: {
          traceId: 'd81f7656-fdc2-470d-bd13-e6ce95d2cd6a',
          operatorId: 'f650e73e-4aad-3900-fd34-355077b5a34d',
          plantId: '591bb86e-19c4-4b36-bf72-a80a2d26ce0a',
          partsName: 'Test-001',
          supportPartsName: 'Supp-001',
          terminatedFlag: false,
          amountRequired: 0.5,
          amountRequiredUnit: 'kilogram',
          level: 2,
        },
      },
    ]);
  });

  test('cfpModelのcfpIdとghgEmissionがnullの場合の変換の確認', () => {
    expect(
      convertPartsDataListAndCfpModelListToPartsWithCfpDataList(
        partsList,
        cfpModelListWithNullCfpIdAndGhgEmission
      )
    ).toStrictEqual([
      {
        parts: {
          traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
          operatorId: 'f650e73e-4aad-3900-fd34-355077b5a34d',
          plantId: '591bb86e-19c4-4b36-bf72-a80a2d26ce0a',
          partsName: 'Test-002',
          supportPartsName: 'Supp-002',
          terminatedFlag: true,
          amountRequired: 1,
          amountRequiredUnit: 'kilogram',
          level: 2,
        },
        cfps: {
          mainProductionTotal: {
            cfpId: '',
            emission: 0,
            unit: 'kgCO2e/kilogram',
            traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
            dqrType: 'mainProcessingTotal',
            dqrValue: {
              TeR: undefined,
              GeR: undefined,
              TiR: undefined,
            },
          },
          preComponentTotal: {
            cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
            emission: 0,
            unit: 'kgCO2e/kilogram',
            traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
            dqrType: 'preProcessingTotal',
            dqrValue: {
              TeR: 4.1,
              GeR: 4.2,
              TiR: 4.3,
            },
          },
          mainComponentTotal: {
            cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
            emission: 0,
            unit: 'kgCO2e/kilogram',
            traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
            dqrType: 'mainProcessingTotal',
            dqrValue: {
              TeR: 4.4,
              GeR: 4.5,
              TiR: 4.6,
            },
          },
          preProduction: {
            cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
            emission: 0,
            unit: 'kgCO2e/kilogram',
            traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
            dqrType: 'preProcessing',
            dqrValue: {
              TeR: 0,
              GeR: 0,
              TiR: 0,
            },
          },
          mainProduction: {
            cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
            emission: 0,
            unit: 'kgCO2e/kilogram',
            traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
            dqrType: 'mainProcessing',
            dqrValue: {
              TeR: 3.1,
              GeR: 3.2,
              TiR: 3.3,
            },
          },
          preComponent: {
            cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
            emission: 3.3,
            unit: 'kgCO2e/kilogram',
            traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
            dqrType: 'preProcessing',
            dqrValue: {
              TeR: 0,
              GeR: 0,
              TiR: 0,
            },
          },
          mainComponent: {
            cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
            emission: 4.4,
            unit: 'kgCO2e/kilogram',
            traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
            dqrType: 'mainProcessing',
            dqrValue: {
              TeR: 3.1,
              GeR: 3.2,
              TiR: 3.3,
            },
          },
          preProductionTotal: {
            cfpId: '7d3ff947-37d1-4811-971e-9d4b21be0642',
            emission: 0,
            unit: 'kgCO2e/kilogram',
            traceId: '3aa8fd0c-05e1-4cc5-a1b2-d6807ed63477',
            dqrType: 'preProcessingTotal',
            dqrValue: {
              TeR: 4.1,
              GeR: 4.2,
              TiR: 4.3,
            },
          },
        },
      },
      {
        parts: {
          traceId: 'd81f7656-fdc2-470d-bd13-e6ce95d2cd6a',
          operatorId: 'f650e73e-4aad-3900-fd34-355077b5a34d',
          plantId: '591bb86e-19c4-4b36-bf72-a80a2d26ce0a',
          partsName: 'Test-001',
          supportPartsName: 'Supp-001',
          terminatedFlag: false,
          amountRequired: 0.5,
          amountRequiredUnit: 'kilogram',
          level: 2,
        },
      },
    ]);
  });
});

describe('convertPartsWithCfpToCfpModel', () => {
  const parts: Parts = {
    level: 1,
    partsName: 'partsName',
    supportPartsName: 'supportPartsName',
    amountRequired: 3,
    amountRequiredUnit: 'kilogram',
    operatorId: 'operatorId',
    plantId: 'plantId',
    terminatedFlag: true,
  };

  test('変換の確認', () => {
    const cfps: PartsWithCfpDataType['cfps'] = {
      preProduction: {
        emission: 10,
        unit: 'kgCO2e/kilogram',
        traceId: 'traceId',
        dqrType: 'preProcessing',
        dqrValue: {},
      },
      mainProduction: {
        emission: 20,
        unit: 'kgCO2e/kilogram',
        traceId: 'traceId',
        cfpId: 'cfpId',
        dqrType: 'mainProcessing',
        dqrValue: {
          TeR: 1.2,
          TiR: 4.3,
          GeR: 3.1,
        },
      },
      preComponent: {
        emission: 0,
        unit: 'kgCO2e/kilogram',
        traceId: 'traceId',
        cfpId: 'cfpId',
        dqrType: 'preProcessing',
        dqrValue: {},
      },
      mainComponent: {
        emission: 0,
        unit: 'kgCO2e/kilogram',
        traceId: 'traceId',
        cfpId: 'cfpId',
        dqrType: 'mainProcessing',
        dqrValue: {
          TeR: 1.2,
          TiR: 4.3,
          GeR: 3.1,
        },
      },
    };
    const cfpModels: CfpModel[] = [
      {
        cfpId: null,
        cfpType: 'preProduction',
        ghgDeclaredUnit: 'kgCO2e/kilogram',
        ghgEmission: 10,
        traceId: 'traceId',
        dqrType: 'preProcessing',
        dqrValue: {
          TeR: null,
          TiR: null,
          GeR: null,
        },
      },
      {
        cfpId: 'cfpId',
        cfpType: 'mainProduction',
        ghgDeclaredUnit: 'kgCO2e/kilogram',
        ghgEmission: 20,
        traceId: 'traceId',
        dqrType: 'mainProcessing',
        dqrValue: {
          TeR: 1.2,
          TiR: 4.3,
          GeR: 3.1,
        },
      },
      {
        cfpId: 'cfpId',
        cfpType: 'preComponent',
        ghgDeclaredUnit: 'kgCO2e/kilogram',
        ghgEmission: 0,
        traceId: 'traceId',
        dqrType: 'preProcessing',
        dqrValue: {
          TeR: null,
          TiR: null,
          GeR: null,
        },
      },
      {
        cfpId: 'cfpId',
        cfpType: 'mainComponent',
        ghgDeclaredUnit: 'kgCO2e/kilogram',
        ghgEmission: 0,
        traceId: 'traceId',
        dqrType: 'mainProcessing',
        dqrValue: {
          TeR: 1.2,
          TiR: 4.3,
          GeR: 3.1,
        },
      },
    ];

    expect(convertPartsWithCfpToCfpModel({ parts, cfps })).toEqual(cfpModels);
  });

  test('期待されるcfpTypeのCFP情報がなかった場合', () => {
    expect(() => convertPartsWithCfpToCfpModel({ parts })).toThrow(
      "Couldn't find Cfp data."
    );
  });
});

describe('convertTradeResponseDataTypeToRejectStatusModel', () => {
  const tradeResponseData: TradeResponseDataType = {
    downstreamOperatorId: 'downstream',
    downstreamTraceId: 'traceId',
    status: 'remanded',
    replyMessage: '回答差戻し時のメッセージが入ります',
    tradeId: 'ccc',
    statusId: 'd9a38406-cae2-4679-b052-15a75f5531f0',
    message: '回答依頼時のメッセージが入ります',
    tradeTreeStatus: 'TERMINATED',
  };

  const expected: StatusModel = {
    message: '回答依頼時のメッセージが入ります',
    replyMessage: '回答差戻し時のメッセージが入ります',
    requestStatus: {
      cfpResponseStatus: 'REJECT',
      tradeTreeStatus: 'TERMINATED',
    },
    requestType: 'CFP',
    statusId: 'd9a38406-cae2-4679-b052-15a75f5531f0',
    tradeId: 'ccc',
  };

  test('TradeResponseDataTypeをStatusModelに変換', () => {
    const result =
      convertTradeResponseDataTypeToRejectStatusModel(tradeResponseData);
    expect(result).toEqual(expected);
  });
  test('値がnullの場合の変換', () => {
    const result = convertTradeResponseDataTypeToRejectStatusModel({
      ...tradeResponseData,
      replyMessage: undefined,
      statusId: undefined,
      tradeId: undefined,
      message: undefined,
    });
    expect(result).toEqual({
      ...expected,
      replyMessage: null,
      statusId: null,
      tradeId: null,
      message: null,
    });
  });
});

describe('convertOperatorModelToOperator', () => {
  const model: OperatorModel = {
    openOperatorId: '9876543210987',
    operatorAddress: 'xx県xx市xxxx町1-1',
    operatorAttribute: {
      globalOperatorId: 'sampleId1',
    },
    operatorId: 'd9a38406-cae2-4679-b052-15a75f5531e6',
    operatorName: 'A株式会社',
  };

  const grobalOperatorIdNullModel: OperatorModel = {
    openOperatorId: '9876543210987',
    operatorAddress: 'xx県xx市xxxx町1-1',
    operatorAttribute: {},
    operatorId: 'd9a38406-cae2-4679-b052-15a75f5531e6',
    operatorName: 'A株式会社',
  };
  test('変換の確認', () => {
    expect(convertOperatorModelToOperator(model)).toStrictEqual({
      openOperatorId: '9876543210987',
      operatorId: 'd9a38406-cae2-4679-b052-15a75f5531e6',
      operatorName: 'A株式会社',
      globalOperatorId: 'sampleId1',
    });
  });

  test('グローバル事業者識別がない場合', () => {
    expect(
      convertOperatorModelToOperator(grobalOperatorIdNullModel)
    ).toStrictEqual({
      openOperatorId: '9876543210987',
      operatorId: 'd9a38406-cae2-4679-b052-15a75f5531e6',
      operatorName: 'A株式会社',
      globalOperatorId: undefined,
    });
  });
});

describe('convertPlantModelToPlant', () => {
  const model = {
    openPlantId: 'openid',
    operatorId: 'opeid',
    plantAddress: 'address',
    plantId: 'plant12',
    plantName: 'plantN',
    plantAttribute: {
      globalPlantId: 'gp',
    },
  };
  test('変換の確認', () => {
    expect(convertPlantModelToPlant(model)).toStrictEqual({
      plantId: 'plant12',
      openPlantId: 'openid',
      plantName: 'plantN',
      plantAddress: 'address',
      globalPlantId: 'gp',
    });
  });
  test('palntIdがnullの場合', () => {
    expect(convertPlantModelToPlant({ ...model, plantId: null })).toStrictEqual(
      {
        plantId: undefined,
        openPlantId: 'openid',
        plantName: 'plantN',
        plantAddress: 'address',
        globalPlantId: 'gp',
      }
    );
  });
  test('globalPlantIdがnullの場合', () => {
    expect(
      convertPlantModelToPlant({
        ...model,
        plantAttribute: {},
      })
    ).toStrictEqual({
      plantId: 'plant12',
      openPlantId: 'openid',
      plantName: 'plantN',
      plantAddress: 'address',
      globalPlantId: undefined,
    });
  });

  describe('convertCfpCertificationModelToCfpCertification', () => {
    test('変換の確認', () => {
      const input: CfpCertificationModel = {
        cfpCertificationId: 'certification-dummy-id',
        traceId: 'certification-dummy-trace-id',
        cfpCertificationDescription: 'certification-dummy-desc',
        cfpCertificationFileInfo: [
          {
            operatorId: 'certification-dummy-operator-id',
            fileId: 'certification-dummy-file-id',
            fileName: 'B01_CFP.xlsx',
          },
          {
            operatorId: 'certification-dummy-operator-id',
            fileId: 'certification-dummy-file-id-2',
            fileName: 'B02_CFP.docx',
          },
        ],
      };
      const expected: CertificationDataType = {
        cfpCertificationId: 'certification-dummy-id',
        traceId: 'certification-dummy-trace-id',
        linkedTraceId: 'certification-dummy-linked-trace-id',
        cfpCertificationDescription: 'certification-dummy-desc',
        cfpCertificationFileInfo: [
          {
            operatorId: 'certification-dummy-operator-id',
            fileId: 'certification-dummy-file-id',
            fileName: 'B01_CFP.xlsx',
          },
          {
            operatorId: 'certification-dummy-operator-id',
            fileId: 'certification-dummy-file-id-2',
            fileName: 'B02_CFP.docx',
          },
        ],
      };
      expect(
        convertCfpCertificationModelToCfpCertification(
          'certification-dummy-linked-trace-id',
          input
        )
      ).toStrictEqual(expected);

      const input2: CfpCertificationModel = {
        cfpCertificationId: 'certification-dummy-id',
        traceId: 'certification-dummy-trace-id',
        cfpCertificationDescription: null,
      };
      const expected2: CertificationDataType = {
        cfpCertificationId: 'certification-dummy-id',
        traceId: 'certification-dummy-trace-id',
        linkedTraceId: 'certification-dummy-linked-trace-id',
        cfpCertificationFileInfo: [],
      };
      expect(
        convertCfpCertificationModelToCfpCertification(
          'certification-dummy-linked-trace-id',
          input2
        )
      ).toEqual(expected2);

      expect(
        convertCfpCertificationModelToCfpCertification(
          'certification-dummy-linked-trace-id',
          undefined
        )
      ).toBe(undefined);
    });
  });
});

describe('convertPlantToPlantModel', () => {
  const plantRegisterForm: Plant = {
    plantId: 'plant12',
    openPlantId: 'openid',
    plantName: 'plantN',
    plantAddress: 'address',
    globalPlantId: 'gp',
  };

  const incompletePlantRegisterForm: Plant = {
    plantId: undefined,
    openPlantId: 'openid',
    plantName: 'plantN',
    plantAddress: undefined,
    globalPlantId: undefined,
  };

  test('変換の確認', () => {
    expect(convertPlantToPlantModel(plantRegisterForm, 'opid')).toEqual({
      openPlantId: 'openid',
      operatorId: 'opid',
      plantAddress: 'address',
      plantId: 'plant12',
      plantName: 'plantN',
      plantAttribute: {
        globalPlantId: 'gp',
      },
    });
  });
  test('値がundefinedの場合', () => {
    expect(
      convertPlantToPlantModel(incompletePlantRegisterForm, 'opid')
    ).toStrictEqual({
      plantId: null,
      openPlantId: 'openid',
      operatorId: 'opid',
      plantName: 'plantN',
      plantAddress: '',
      plantAttribute: {},
    });
  });
});

describe('convertStatusModelToTradeStatus', () => {
  const statusModel: StatusModel = {
    requestType: 'CFP',
    tradeId: 'xxx',
    requestStatus: {
      cfpResponseStatus: 'COMPLETED',
      tradeTreeStatus: 'TERMINATED',
    },
    message: 'message',
    replyMessage: 'replyMessage',
    statusId: 'statusId',
  };
  const expectedStatusData: TradeStatus = {
    requestStatus: {
      cfpResponseStatus: 'COMPLETED',
      tradeTreeStatus: 'TERMINATED',
    },
    message: 'message',
    replyMessage: 'replyMessage',
    statusId: 'statusId',
  };
  const statusModelWithNullData: StatusModel = {
    requestType: 'CFP',
    tradeId: null,
    requestStatus: {
      cfpResponseStatus: 'COMPLETED',
      tradeTreeStatus: 'TERMINATED',
    },
    message: null,
    replyMessage: null,
    statusId: null,
  };
  const expectedStatusDataWithNullData: TradeStatus = {
    requestStatus: {
      cfpResponseStatus: 'COMPLETED',
      tradeTreeStatus: 'TERMINATED',
    },
    message: undefined,
    replyMessage: undefined,
    statusId: undefined,
  };
  test('変換の確認', () => {
    expect(convertStatusModelToTradeStatus(statusModel))
      .toStrictEqual(expectedStatusData);
    expect(convertStatusModelToTradeStatus(statusModelWithNullData))
      .toStrictEqual(expectedStatusDataWithNullData);
  });
});


describe('convertTradeStatusToStatusModel', () => {
  const tradeStatus: TradeStatus = {
    requestStatus: {
      cfpResponseStatus: 'COMPLETED',
      tradeTreeStatus: 'TERMINATED',
    },
    message: 'message',
    replyMessage: 'replyMessage',
    statusId: 'statusId',
  };
  const expectedStatusModel: StatusModel = {
    requestType: 'CFP',
    tradeId: 'xxx',
    requestStatus: {
      cfpResponseStatus: 'COMPLETED',
      tradeTreeStatus: 'TERMINATED',
    },
    message: 'message',
    replyMessage: 'replyMessage',
    statusId: 'statusId',
  };
  const tradeStatusWithUndefinedData: TradeStatus = {
    requestStatus: {
      cfpResponseStatus: 'COMPLETED',
      tradeTreeStatus: 'TERMINATED',
    },
    message: undefined,
    replyMessage: undefined,
    statusId: undefined,
  };
  const expectedStatusModelWithUndefinedData: StatusModel = {
    requestType: 'CFP',
    tradeId: 'xxx',
    requestStatus: {
      cfpResponseStatus: 'COMPLETED',
      tradeTreeStatus: 'TERMINATED',
    },
    message: null,
    replyMessage: null,
    statusId: null,
  };
  test('変換の確認', () => {
    expect(convertTradeStatusToStatusModel(tradeStatus, 'xxx'))
      .toStrictEqual(expectedStatusModel);
    expect(convertTradeStatusToStatusModel(tradeStatusWithUndefinedData, 'xxx'))
      .toStrictEqual(expectedStatusModelWithUndefinedData);
  });
});