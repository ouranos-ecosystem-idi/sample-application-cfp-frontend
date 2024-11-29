import {
  CertificationDataType,
  Plant,
  PartsStructure,
  PartsWithCfpDataType,
  Parts,
  TradeResponseDataType,
  TradeStatus,
  TradeRequestDataType
} from '@/lib/types';
import { CfpRequestFormRowType } from '@/components/organisms/CfpRequestTable';
import {
  convertCfpRequestFormRowTypeToTradeRequestModel,
  convertPartsModelToPartsWithoutLevel,
  convertNotificationModelListToNotificationDataTypeList,
  convertPartsDataAndTradeModelToTradeRequestDataType,
  convertPartsDataListAndCfpModelListToPartsWithCfpDataList,
  convertTradeResponseModelToTradeResponseDataType,
  convertTradeResponseModelListToTradeResponseDataTypeList,
  convertPartsStructureModelToPartsStructure,
  convertPartsWithCfpToCfpModel,
  convertTradeStatusToStatusModel,
  convertTradeResponseDataTypeToRejectStatusModel,
  convertOperatorModelToOperator,
  convertPlantModelToPlant,
  convertPlantToPlantModel,
  convertPartsModelToParts,
  convertPartsStructureToPartsStructureModel,
  convertCfpCertificationModelToCfpCertification,
  convertStatusModelToTradeStatus
} from '@/lib/converters';
import { dataTransportApiClient } from '@/api/dataTransport';
import { traceabilityApiClient } from '@/api/traceability';
import { getOperatorId } from '@/api/accessToken';
import { PARTS_NUM } from '@/lib/constants';
import { retryWithInterval, splitArrayIntoChunks } from '@/lib/utils';

export const repository = {
  async login(loginForm: {
    operatorAccountId: string;
    accountPassword: string;
  }) {
    return await dataTransportApiClient.login(loginForm);
  },
  async refreshAccessToken({ refreshToken }: { refreshToken: string; }) {
    return await dataTransportApiClient.refreshAccessToken({ refreshToken });
  },

  async getPlants() {
    return (await dataTransportApiClient.getPlants()).map(
      convertPlantModelToPlant
    );
  },

  /**
   * 親部品一覧を取得
   */
  async getParentParts(after?: string, signal?: AbortSignal) {
    const { res, next } = await dataTransportApiClient.getParts(
      {
        parentFlag: true,
        limit: PARTS_NUM,
        after,
      },
      signal
    );
    return {
      res: res.map((p) => convertPartsModelToParts(p, 1)),
      next,
    };
  },

  /**
   * トレース識別子をもとに1件の親部品情報を取得
   */
  async getParentPartsByTraceId(traceId: string) {
    const { res } = await dataTransportApiClient.getParts({
      traceId,
      parentFlag: true,
      limit: 1,
    });
    const first = res.at(0);
    return first === undefined ? undefined : convertPartsModelToParts(first, 1);
  },

  /**
   * トレース識別子をもとに1件の部品情報を取得
   */
  async getParts(traceId: string) {
    const { res } = await dataTransportApiClient.getParts({
      traceId,
      limit: 1,
    });
    if (res.length === 0) return undefined;
    return convertPartsModelToPartsWithoutLevel(res[0]);
  },

  async registerPartsStructure(partsStructure: PartsStructure) {
    const req = convertPartsStructureToPartsStructureModel(partsStructure);
    if (req) {
      await dataTransportApiClient.putPartsStructure(req);
    }
    return;
  },

  // トレース識別子に対する部品構成を取得する
  async getPartsStructure(traceId: string) {
    return convertPartsStructureModelToPartsStructure(
      await dataTransportApiClient.getPartsStructure(traceId)
    );
  },

  // 部品情報に対して、取引関係情報を取得する
  async getEachTradeData(partsList: Parts[]) {
    const traceIds = partsList
      .map((part) => {
        return part.traceId;
      })
      .filter((traceId) => traceId !== undefined) as string[];

    const tradeRequests = await dataTransportApiClient.getTradeRequests(
      traceIds
    );

    return convertPartsDataAndTradeModelToTradeRequestDataType(
      partsList,
      tradeRequests
    );
  },

  // 取引関係情報に対して、ステータスとメッセージを取得する
  async getEachRequestStatus(tradeRequests: TradeRequestDataType[]) {
    const TRADE_STATUS_API_CALL_LIMIT = 5;
    let tradeRequestsResult = [];
    // APIの負荷軽減のため、チャンクごとに並列呼び出し
    const tradeRequestsChunk = splitArrayIntoChunks(
      tradeRequests,
      TRADE_STATUS_API_CALL_LIMIT
    );

    for (let chunk of tradeRequestsChunk) {
      const results = await Promise.all(
        chunk.map(async (tradeRequest) => {
          const _status = await dataTransportApiClient.getTradeStatus({
            traceId: tradeRequest.downStreamPart.traceId
          });
          return {
            ...tradeRequest,
            ...(_status && { tradeStatus: convertStatusModelToTradeStatus(_status) }),
          };
        })
      );
      tradeRequestsResult.push(results);
    }
    return tradeRequestsResult.flat(1);
  },

  // 受領依頼一覧を取得する
  async getTradeResponses(after?: string) {
    const { res, next } = await dataTransportApiClient.getTradeResponse({
      after,
    });
    return {
      res: convertTradeResponseModelListToTradeResponseDataTypeList(
        res
      ),
      next,
    };
  },

  // ステータスIDに対する受領依頼情報を取得する
  async getTradeResponse(statusId: string) {
    const { res } = await dataTransportApiClient.getTradeResponse({
      limit: 1,
      after: statusId,
    });
    const tradeResponse = res.at(0);
    return tradeResponse === undefined ? undefined
      : convertTradeResponseModelToTradeResponseDataType(tradeResponse);
  },

  async requestCfp(requestCfpForm: CfpRequestFormRowType) {
    const operatorId = getOperatorId();

    await dataTransportApiClient.putTradeRequests(
      convertCfpRequestFormRowTypeToTradeRequestModel(
        requestCfpForm,
        operatorId
      )
    );
  },

  // 部品紐付け
  async linkPartsWithTradeRequest(data: { tradeId: string; traceId: string; }) {
    return dataTransportApiClient.putTradeResponse(data);
  },

  // CFP情報&CFP証明書情報 公開設定
  async setCfpAclOnValueAndCert(data: {
    releasedToOperatorId: string;
    traceId: string;
  }) {
    const operatorId = getOperatorId();

    const tryNum = 6; // リトライが最大5回+最初の1回
    const waitingTime = 2000; // 待機時間は2000ms
    return Promise.all(
      [
        traceabilityApiClient.postCfpAcl,
        traceabilityApiClient.postCfpCertificationAcl,
      ].map((post) => {
        return retryWithInterval(
          Array(tryNum).fill(() => post({ ...data, operatorId })),
          waitingTime
        );
      })
    );
  },

  // 通知情報を取得する
  async getNotifications(data: {
    notifiedAtFrom?: string;
    notifiedAtTo?: string;
    after?: string;
  }) {
    const operatorId = getOperatorId();
    const res = await traceabilityApiClient.getNotifications({
      operatorId,
      ...data,
    });
    if (res.notifications === undefined) return { res: [], next: res.next };
    return {
      res: convertNotificationModelListToNotificationDataTypeList(
        res.notifications
      ),
      next: res.next ?? undefined, // Schemaと異なりnullが返ってくるため変換
    };
  },
  // 部品ごとにCFP値を取得し、付加する
  async getEachCfpsOfParts(
    parts: Parts[],
    signal?: AbortSignal
  ): Promise<PartsWithCfpDataType[]> {
    const traceIds = parts
      .map((p) => p.traceId)
      .filter((s) => s !== undefined) as string[];

    //子部品が存在しない場合はCFP情報を取得しない
    if (traceIds.length === 0) return parts.map((p) => ({ parts: p }));

    const cfps = await dataTransportApiClient.getCfpsByTraceIds(
      traceIds,
      signal
    );
    return convertPartsDataListAndCfpModelListToPartsWithCfpDataList(
      parts,
      cfps
    );
  },
  async registerCfp(partsWithCfpData: PartsWithCfpDataType) {
    return dataTransportApiClient.putCfp(
      convertPartsWithCfpToCfpModel(partsWithCfpData)
    );
  },

  async updateTradeStatusToCancel(
    tradeStatus: TradeStatus,
    tradeId: string
  ): Promise<boolean> {

    const statusModel =
      convertTradeStatusToStatusModel({
        ...tradeStatus,
        requestStatus: {
          cfpResponseStatus: 'CANCEL',  // 既存のStatusを上書き
          tradeTreeStatus: tradeStatus.requestStatus.tradeTreeStatus
        }
      }, tradeId);

    // ステータスの更新
    const response = await dataTransportApiClient.putTradeStatus(statusModel);

    //201 ステータスコードが返却された場合に true を返す
    return response === 201;
  },
  async updateTradeResponseRejectStatus(
    tradeResponseData: TradeResponseDataType
  ): Promise<boolean> {
    const statusModel =
      convertTradeResponseDataTypeToRejectStatusModel(tradeResponseData);

    // ステータスの更新
    const response = await dataTransportApiClient.putTradeStatus(statusModel);

    //201 ステータスコードが返却された場合に true を返す
    return response === 201;
  },
  async getOperatorByOpenOperatorId(openOperatorId?: string) {
    const model = await dataTransportApiClient.getOperatorByOpenOperatorId(
      openOperatorId
    );
    return convertOperatorModelToOperator(model);
  },
  async getOperators(operatorIds: string[]) {
    if (operatorIds.length === 0) return [];
    const models = await dataTransportApiClient.getOperators(
      //重複を排除
      Array.from(new Set(operatorIds))
    );
    return models.map(convertOperatorModelToOperator);
  },
  registerPlantsData(plantRegisterForm: Plant) {
    const operatorId = getOperatorId();
    const req = convertPlantToPlantModel(plantRegisterForm, operatorId);
    return req && dataTransportApiClient.putPlants(req);
  },
  // CFP証明書情報および証明書ファイルを登録する
  async registerCfpCertifications(data: {
    traceId: string;
    cfpCertificationId?: string;
    cfpCertificationDescription?: string;
    cfpCertificationFiles: File[];
  }) {
    const operatorId = getOperatorId();
    const status = await traceabilityApiClient.postCfpCertifications({
      operatorId,
      ...data,
    });
    return status === 200;
  },

  // traceIdに紐づくCFP証明書情報を取得する
  async getCfpCertification(
    traceId: string
  ): Promise<CertificationDataType | undefined> {
    return convertCfpCertificationModelToCfpCertification(
      traceId,
      await dataTransportApiClient.getCfpCertification(traceId)
    );
  },

  // 複数のtraceIdをもとにそれらに紐づくCFP証明書情報を取得する
  async getCfpCertifications(
    traceIds: string[]
  ): Promise<CertificationDataType[]> {
    //NOTE: 当アプリケーション開発時点では、APIを並列で呼ぶと過負荷状態となる制約があったため、直列で実行している
    // 制約が解かれれば並列実行が望ましい
    const certs: CertificationDataType[] = [];
    for (let traceId of traceIds) {
      const cert = await this.getCfpCertification(traceId);
      if (cert !== undefined) certs.push(cert);
    }
    return certs;
  },

  // CFP証明書ファイルをダウンロードする
  async downloadCfpCertificationFile(
    fileId: string,
    fileOperatorId: string,
    cfpCertificationId: string,
    downloadType: 'OWN' | 'OTHER'
  ) {
    const operatorId = getOperatorId();

    // contentはbase64URLでエンコードされている。
    const content = await traceabilityApiClient.getCfpCertificationFiles({
      operatorId,
      fileOperatorId,
      fileId,
      downloadType,
      cfpCertificationId,
    });

    // base64URL->base64に変換
    const baseURLDecoded = content.replace(/-/g, '+').replace(/_/g, '/');

    // base64->バイナリに変換
    const decodedContent = Buffer.from(baseURLDecoded, 'base64');

    return new Blob([decodedContent]);
  },

  // 部品構成情報を削除する
  async deletePartsStructure(traceId: string) {
    await dataTransportApiClient.deleteParts(traceId);
  },
};
