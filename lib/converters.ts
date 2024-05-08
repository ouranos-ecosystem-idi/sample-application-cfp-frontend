import {
  Operator,
  CfpDataType,
  PartsFormRowType,
  PartsFormType,
  PartsWithCfpDataType,
  TradeResponseDataType,
  Plant,
  CertificationDataType,
  PartsWithoutLevel,
  TradeRequestDataType,
  Parts,
  PartsStructure,
  PartLevel,
  NotificationDataType,
  TradeStatus
} from '@/lib/types';
import { getRequestStatus, getResponseStatus } from '@/lib/utils';
import { CfpRequestFormRowType } from '@/components/organisms/CfpRequestTable';
import {
  CfpCertificationModel,
  CfpModel,
  OperatorModel,
  PartsModel,
  PartsStructureModel,
  PlantModel,
  StatusModel,
  TradeModel,
  TradeRequestModel,
  TradeResponseModel,
} from '@/api/models/dataTransport';
import { NotificationModel } from '@/api/models/traceability';

export function convertPartsModelToPartsWithoutLevel(
  parts: PartsModel
): PartsWithoutLevel {
  return {
    ...parts,
    amountRequiredUnit: parts.amountRequiredUnit ?? undefined,
    partsName: parts.partsName ?? '',
    supportPartsName: parts.supportPartsName ?? '',
    traceId: parts.traceId ?? undefined,
  };
}

export function convertPartsModelToParts(
  parts: PartsModel,
  level: PartLevel
): Parts {
  return { ...convertPartsModelToPartsWithoutLevel(parts), level };
}

export function convertPartsStructureModelToPartsStructure({
  parentPartsModel,
  childrenPartsModel,
}: PartsStructureModel): PartsStructure {
  return {
    parentParts: convertPartsModelToParts(parentPartsModel, 1),
    childrenParts: childrenPartsModel.map((p) =>
      convertPartsModelToParts(p, 2)
    ),
  };
}

export function convertPartsFormTypeToPartsStructure(
  form: PartsFormType,
  operatorId: string
): PartsStructure {
  function convertFormRowToParts(
    data: PartsFormRowType,
    level: PartLevel
  ): Parts {
    return {
      level,
      amountRequired:
        data.amountRequired === '' ? null : Number(data.amountRequired),
      amountRequiredUnit:
        data.amountRequiredUnit === '' ? undefined : data.amountRequiredUnit,
      operatorId: operatorId,
      partsName: data.partsName,
      plantId: data.plantId,
      supportPartsName: data.supportPartsName,
      terminatedFlag: data.terminatedFlag,
      traceId: data.traceId,
    };
  }
  return {
    parentParts: convertFormRowToParts(form.parentParts, 1),
    childrenParts: form.childrenParts.map((p) => convertFormRowToParts(p, 2)),
  };
}

export function convertPartsToPartsModel(parts: Parts): PartsModel {
  return {
    amountRequired: parts.amountRequired,
    amountRequiredUnit: parts.amountRequiredUnit ?? null,
    operatorId: parts.operatorId,
    partsName: parts.partsName,
    plantId: parts.plantId,
    supportPartsName: parts.supportPartsName,
    terminatedFlag: parts.terminatedFlag,
    traceId: parts.traceId ?? null,
  };
}

export function convertPartsStructureToPartsStructureModel(
  partsStructure: PartsStructure
): PartsStructureModel {
  return {
    parentPartsModel: {
      ...convertPartsToPartsModel(partsStructure.parentParts),
      amountRequired: null, //親部品取得時は1が入るが、登録時にはnullにしないといけないため。
    },
    childrenPartsModel: partsStructure.childrenParts.map(
      convertPartsToPartsModel
    ),
  };
}

export function convertPartsDataAndTradeModelToTradeRequestDataType(
  partsData: Parts[],
  trade: TradeModel[]
): TradeRequestDataType[] {
  return partsData.map((parts) => {
    const _trade = trade.find(
      ({ downstreamTraceId }) => downstreamTraceId === parts.traceId
    );

    return {
      downStreamPart: parts,
      tradeId: _trade?.tradeId || '',
      upstreamOperatorId: _trade?.upstreamOperatorId,
    };
  });
}

export function convertStatusModelToTradeStatus(
  status: StatusModel
): TradeStatus {
  return {
    requestStatus: status.requestStatus,
    message: status.message ?? undefined,
    replyMessage: status.replyMessage ?? undefined,
    statusId: status.statusId ?? undefined
  };
}

export function convertTradeResponseModelListToTradeResponseDataTypeList(
  tradeResponseData: TradeResponseModel[]
): TradeResponseDataType[] {
  return tradeResponseData.map(convertTradeResponseModelToTradeResponseDataType);
}

export function convertTradeResponseModelToTradeResponseDataType(
  tradeResponse: TradeResponseModel
): TradeResponseDataType {
  return {
    tradeId: tradeResponse.tradeModel.tradeId ?? undefined,
    replyMessage: tradeResponse.statusModel.replyMessage ?? undefined,
    downstreamOperatorId: tradeResponse.tradeModel.downstreamOperatorId,
    upstreamTraceId: tradeResponse.tradeModel.upstreamTraceId ?? undefined,
    downstreamTraceId: tradeResponse.tradeModel.downstreamTraceId,
    statusId: tradeResponse.statusModel.statusId ?? undefined,
    status: getResponseStatus(
      tradeResponse.statusModel.requestStatus.cfpResponseStatus,
    ),
    message: tradeResponse.statusModel.message ?? undefined,
    downstreamPart: convertPartsModelToPartsWithoutLevel(
      tradeResponse.partsModel
    ),
    tradeTreeStatus: tradeResponse.statusModel.requestStatus.tradeTreeStatus
  };
}

export function convertCfpRequestFormRowTypeToTradeRequestModel(
  formRow: CfpRequestFormRowType,
  userOperatorId: string
): TradeRequestModel {
  return {
    statusModel: {
      message: formRow.message,
      // @ts-ignore 仕様書のモデル上requestStatusは中身の指定が必要だが、仕様書のexampleでは空オブジェクトでリクエストするのが正とされているため、型エラーを無視する
      requestStatus: {},
      requestType: 'CFP',
      statusId: null,
      tradeId: null,
    },
    tradeModel: {
      downstreamOperatorId: userOperatorId,
      downstreamTraceId: formRow.downstreamTraceId,
      tradeId: null,
      upstreamOperatorId: formRow.upstreamOperatorId,
      upstreamTraceId: null,
    },
  };
}

export function convertNotificationModelToNotificationDataType(
  notification: NotificationModel
): NotificationDataType {
  return {
    notificationId: notification.notificationId!,
    notificationType: notification.notificationType!,
    notifiedFromOperatorId: notification.notifiedFromOperatorId!,
    notifiedAt: new Date(notification.notifiedAt!),
    tradeRelation: notification.tradeRelation!,
  };
}

export function convertNotificationModelListToNotificationDataTypeList(
  notifications: NotificationModel[]
): NotificationDataType[] {
  const result = notifications.map((n) =>
    convertNotificationModelToNotificationDataType(n)
  );
  return result as NotificationDataType[];
}

export function convertPartsDataListAndCfpModelListToPartsWithCfpDataList(
  partsList: Parts[],
  cfpModelList: CfpModel[]
): PartsWithCfpDataType[] {
  return partsList.map((parts) => {
    const _cfpModels: CfpModel[] = cfpModelList.filter(
      (cfp) => cfp.traceId === parts.traceId
    );
    function convertCfpModelToCfpDataType(cfpModel: CfpModel): CfpDataType {
      return {
        cfpId: cfpModel.cfpId ?? '',
        emission: cfpModel.ghgEmission ?? 0,
        unit: cfpModel.ghgDeclaredUnit,
        traceId: cfpModel.traceId,
        dqrType: cfpModel?.dqrType,
        dqrValue: {
          TeR: cfpModel?.dqrValue?.TeR ?? undefined,
          TiR: cfpModel?.dqrValue?.TiR ?? undefined,
          GeR: cfpModel?.dqrValue?.GeR ?? undefined,
        },
      };
    }

    return {
      parts,
      ...(_cfpModels.length > 0 && {
        cfps: _cfpModels.reduce<PartsWithCfpDataType['cfps']>((acc, value) => {
          return {
            ...acc,
            [value.cfpType]: convertCfpModelToCfpDataType(value),
          };
        }, {}),
      }),
    };
  });
}

/**
 * 引数partsWithCfpDataのcfpには'preProduction', 'mainProduction', 'preComponent', 'mainComponent'の4種類のCFPを含める。どれか1つでも存在しない場合はエラーがthrowされる
 */
export function convertPartsWithCfpToCfpModel(
  partsWithCfpData: PartsWithCfpDataType
): CfpModel[] {
  const cfpTypes: CfpModel['cfpType'][] = [
    'preProduction',
    'mainProduction',
    'preComponent',
    'mainComponent',
  ];
  return cfpTypes.map((cfpType) => {
    const cfp = partsWithCfpData?.cfps?.[cfpType];
    if (cfp === undefined) {
      throw new Error("Couldn't find Cfp data.");
    }
    return {
      cfpId: cfp?.cfpId ?? null,
      cfpType,
      ghgDeclaredUnit: cfp.unit,
      ghgEmission: cfp.emission,
      dqrType: cfp.dqrType,
      dqrValue: {
        TeR: cfp.dqrValue.TeR ?? null,
        GeR: cfp.dqrValue.GeR ?? null,
        TiR: cfp.dqrValue.TiR ?? null,
      },
      traceId: cfp.traceId,
    };
  });
}

export function convertOperatorModelToOperator(model: OperatorModel): Operator {
  return {
    operatorId: model.operatorId,
    openOperatorId: model.openOperatorId,
    operatorName: model.operatorName,
    globalOperatorId: model.operatorAttribute?.globalOperatorId ?? undefined,
  };
}

export function convertTradeStatusToStatusModel(
  tradeStatus: TradeStatus, tradeId: string
): StatusModel {
  return {
    message: tradeStatus.message ?? null,
    replyMessage: tradeStatus.replyMessage ?? null,
    requestStatus: tradeStatus.requestStatus,
    requestType: 'CFP',
    statusId: tradeStatus.statusId ?? null,
    tradeId: tradeId,
  };
}

export function convertTradeResponseDataTypeToRejectStatusModel(
  tradeResponseData: TradeResponseDataType
): StatusModel {
  return {
    message: tradeResponseData.message ?? null,
    replyMessage: tradeResponseData.replyMessage ?? null,
    requestStatus: {
      cfpResponseStatus: 'REJECT',
      tradeTreeStatus: tradeResponseData.tradeTreeStatus
    },
    requestType: 'CFP',
    statusId: tradeResponseData.statusId ?? null,
    tradeId: tradeResponseData.tradeId ?? null,
  };
}
export function convertPlantModelToPlant(model: PlantModel): Plant {
  return {
    plantId: model.plantId === null ? undefined : model.plantId,
    openPlantId: model.openPlantId,
    plantName: model.plantName,
    plantAddress: model.plantAddress,
    globalPlantId: model.plantAttribute?.globalPlantId ?? undefined,
  };
}

export function convertPlantToPlantModel(
  plantRegisterForm: Plant,
  operatorId: string
): PlantModel {
  const hasGlobalPlantId =
    plantRegisterForm.globalPlantId !== undefined &&
    plantRegisterForm.globalPlantId !== null;

  return {
    openPlantId: plantRegisterForm.openPlantId,
    operatorId: operatorId as string,
    plantAddress: plantRegisterForm.plantAddress ?? '',
    plantId: plantRegisterForm.plantId ?? null,
    plantName: plantRegisterForm.plantName,
    plantAttribute: hasGlobalPlantId
      ? {
        globalPlantId: plantRegisterForm.globalPlantId,
      }
      : {},
  };
}
export function convertCfpCertificationModelToCfpCertification(
  linkedTraceId: string,
  model: CfpCertificationModel | undefined
): CertificationDataType | undefined {
  if (model === undefined) return undefined;
  // 実際はnullは入らないがスキーマ上ではnullableになっているものと思われるpropertyはnullableでないものとして扱う
  return {
    cfpCertificationId: model.cfpCertificationId!,
    traceId: model.traceId!,
    linkedTraceId,
    cfpCertificationDescription: model.cfpCertificationDescription ?? undefined,
    cfpCertificationFileInfo:
      model.cfpCertificationFileInfo?.map((m) => ({
        operatorId: m.operatorId!,
        fileId: m.fileId!,
        fileName: m.fileName!,
      })) ?? [],
  };
}
