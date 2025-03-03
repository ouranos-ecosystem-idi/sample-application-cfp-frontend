export type PartLevel = 1 | 2;

export type Parts = {
  level: PartLevel;
  amountRequired: number | null; // 親部品の活動量はnullであるため
  amountRequiredUnit?: AmountRequiredUnit;
  operatorId: string;
  partsName: string;
  plantId: string;
  supportPartsName: string;
  terminatedFlag: boolean;
  traceId?: string;
  partsLabelName?: string;
  partsAddInfo1?: string;
  partsAddInfo2?: string;
  partsAddInfo3?: string;
};

export type PartsWithoutLevel = Omit<Parts, 'level'>;

export type CfpTypes =
  | 'preProduction'
  | 'mainProduction'
  | 'preComponent'
  | 'mainComponent'
  | 'preProductionTotal'
  | 'mainProductionTotal'
  | 'preComponentTotal'
  | 'mainComponentTotal'
  | 'preProductionResponse'
  | 'mainProductionResponse';

export type NotificationTypes =
  | 'REQUEST_NEW'
  | 'REQUEST_CANCELED'
  | 'REQUEST_REJECTED'
  | 'CFP_RESPONSED'
  | 'CFP_UPDATED'
  | 'REPLY_MESSAGE_REGISTERED';

export type NotificationDataType = {
  notificationId: string;
  notificationType: NotificationTypes;
  notifiedFromOperatorId: string;
  notifiedAt: Date;
  tradeRelation: {
    downstreamTraceId?: string;
    upstreamTraceId?: string;
  };
};

export type DqrType =
  | 'preProcessing'
  | 'mainProcessing'
  | 'preProcessingTotal'
  | 'mainProcessingTotal'
  | 'preProcessingResponse'
  | 'mainProcessingResponse';

export type DqrValueType = {
  TeR?: number;
  GeR?: number;
  TiR?: number;
};

export type CfpDataType = {
  cfpId?: string;
  emission: number;
  traceId: string;
  unit: CfpUnits;
  dqrType: DqrType;
  dqrValue: DqrValueType;
};

export type PartsWithCfpDataType = {
  parts: Parts;
  cfps?: { [K in CfpTypes]?: CfpDataType };
};

export type PartsStructure = {
  parentParts: Parts;
  childrenParts: Parts[];
};

export type TradeRequestStatusType =
  | 'incomplete' // 依頼未完了
  | 'registering-parts' // 部品登録中
  | 'registering-cfp' // CFP登録中
  | 'received' // 回答受領済
  | 'remanded' // 差戻し
  | 'canceled'; // 取消

export type CfpResponseStatusType = 'NOT_COMPLETED' | 'COMPLETED' | 'REJECT' | 'CANCEL';

export type TradeStatus = {
  statusId?: string;
  message?: string; // 依頼メッセージ
  replyMessage?: string;
  requestStatus: {
    cfpResponseStatus: CfpResponseStatusType;
    tradeTreeStatus: TradeTreeStatusType;
    completedCount?: number;
    completedCountModifiedAt?: string;
    tradesCount?: number;
    tradesCountModifiedAt?: string;
  };
  responseDueDate?: string;
};

export type TradeRequestDataType = {
  downStreamPart: Parts;
  tradeId: string; // 取引依頼関係情報識別子
  upstreamOperatorId?: string; // 依頼先事業者識別子
  tradeStatus?: TradeStatus;
};

export type TradeRequestDataTypeWithOperator = TradeRequestDataType & { operator?: Operator; };

export type TradeResponseStatusType =
  | 'incomplete' // 依頼未完了
  | 'sent' // 回答受領済
  | 'remanded'; // 差戻し

export type TradeTreeStatusType = 'TERMINATED' | 'UNTERMINATED';

export type TradeResponseDataType = {
  downstreamOperatorId: string;
  replyMessage?: string;
  downstreamTraceId: string;
  tradeId?: string;
  status: TradeResponseStatusType;
  statusId?: string;
  message?: string;
  upstreamTraceId?: string;
  upstreamPart?: Parts;
  downstreamPart?: PartsWithoutLevel;
  tradeTreeStatus: TradeTreeStatusType;
  responseDueDate?: string;
};

export type PartsFormRowType = {
  amountRequired: number | string;
  amountRequiredUnit: AmountRequiredUnit | '';
  partsName: string;
  plantId: string;
  supportPartsName: string;
  terminatedFlag: boolean;
  traceId?: string;
  partsLabelName?: string;
  partsAddInfo1?: string;
  partsAddInfo2?: string;
  partsAddInfo3?: string;
};

// 入力フォームの型定義(フォーム全体)
export type PartsFormType = {
  parentParts: PartsFormRowType;
  childrenParts: PartsFormRowType[];
};

export type CertificationFileInfoDataType = {
  operatorId: string;
  fileId: string;
  fileName: string;
};

export type CertificationDataType = {
  cfpCertificationId: string;
  traceId: string; // 実際に証明書が登録されているtraceId（最上流となる）
  linkedTraceId: string; // 証明書取得APIの検索元となるtraceId
  cfpCertificationDescription?: string;
  cfpCertificationFileInfo: CertificationFileInfoDataType[];
};

export type Operator = {
  operatorId: string;
  openOperatorId: string;
  operatorName: string;
  globalOperatorId?: string;
};

export type Plant = {
  plantId?: string; // 事業所内部識別子 画面には表示しない
  openPlantId: string; // 画面に表示するId
  plantName: string; // 事業所名
  plantAddress?: string;
  globalPlantId?: string;
};

export const CfpUnits = {
  KgCO2eliter: 'kgCO2e/liter',
  KgCO2ekilogram: 'kgCO2e/kilogram',
  KgCO2ecubicMeter: 'kgCO2e/cubic-meter',
  KgCO2ekilowattHour: 'kgCO2e/kilowatt-hour',
  KgCO2emegajoule: 'kgCO2e/megajoule',
  KgCO2etonKilometer: 'kgCO2e/ton-kilometer',
  KgCO2esquareMeter: 'kgCO2e/square-meter',
  KgCO2eunit: 'kgCO2e/unit',
} as const;

export type CfpUnits = (typeof CfpUnits)[keyof typeof CfpUnits];

export const AmountRequiredUnitsList = [
  'liter',
  'kilogram',
  'cubic-meter',
  'kilowatt-hour',
  'megajoule',
  'ton-kilometer',
  'square-meter',
  'unit',
] as const;

export type AmountRequiredUnit = (typeof AmountRequiredUnitsList)[number];

export type CfpSheetDataType = {
  preEmission: {
    parent: number;
    children: number;
  };
  mainEmission: {
    parent: number;
    children: number;
  };
  unit?: string;
};

export type DqrSheetValueType = {
  TeR?: string;
  TiR?: string;
  GeR?: string;
  dqr?: string;
};

export type DqrSheetDataType = {
  preEmission: DqrSheetValueType;
  mainEmission: DqrSheetValueType;
};

export type UploadFileType =
  | 'txt'
  | 'csv'
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'odt'
  | 'ppt'
  | 'pptx'
  | 'odp'
  | 'xls'
  | 'xlsx'
  | 'ods'
  | 'jpeg'
  | 'jpg'
  | 'bmp'
  | 'gif'
  | 'png'
  | 'zip';
