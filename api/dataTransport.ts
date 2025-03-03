import { getAccessToken } from '@/api/accessToken';
import { DataTransportAPIError } from '@/api/apiErrors';
import {
  CfpCertificationModel,
  CfpModel,
  DataTransportApiErrorModels,
  PartsStructureModel,
  PlantModel,
  StatusModel,
  TradeRequestModel,
} from '@/api/models/dataTransport';
import { NetworkError } from '@/api/networkErrors';
import { paths } from '@/api/schemas/dataTransport';
import { getSignal } from '@/components/template/AbortHandler';
import { splitArrayIntoChunks } from '@/lib/utils';
import { Get, UnionToIntersection } from 'type-fest';

type UrlPaths = keyof paths;

type HttpMethods = keyof UnionToIntersection<paths[keyof paths]>;

type HttpStatus = '200' | '201' | '204';

type HttpMethodsFilteredByPath<Path extends UrlPaths> = HttpMethods &
  keyof UnionToIntersection<paths[Path]>;

type RequestParameters<Path extends UrlPaths, Method extends HttpMethods> = Get<
  paths,
  `${Path}.${Method}.parameters.query`
>;

type RequestData<Path extends UrlPaths, Method extends HttpMethods> = Get<
  paths,
  `${Path}.${Method}.requestBody.content.application/json`
>;

type ResponseData<
  Path extends UrlPaths,
  Method extends HttpMethods,
  Status extends HttpStatus
> = Get<
  paths,
  `${Path}.${Method}.responses.${Status}.content.application/json`
>;

type FetchConfigWrapper<
  Path extends UrlPaths,
  Method extends HttpMethods,
  Status extends HttpStatus
> = {
  url: Path;
  method: Method & HttpMethodsFilteredByPath<Path>;
  params?: RequestParameters<Path, Method>;
  data?: RequestData<Path, Method>;
  headers?: HeadersInit;
  status?: Status;
  signal?: AbortSignal;
};

const DATA_TRANSPORT_API_BASE_URL =
  process.env.NEXT_PUBLIC_DATA_TRANSPORT_API_BASE_URL;
const DATA_TRANSPORT_API_KEY = process.env.NEXT_PUBLIC_DATA_TRANSPORT_API_KEY;

let globalAbortController = new AbortController();

async function fetchFromDataTransport<
  Path extends UrlPaths,
  Method extends HttpMethods,
  Status extends HttpStatus = '200'
>(config: FetchConfigWrapper<Path, Method, Status>) {
  let baseURL = '';
  if (DATA_TRANSPORT_API_BASE_URL) {
    baseURL = DATA_TRANSPORT_API_BASE_URL.replace(/(.+)\/$/, '$1');
  }

  // URL Parametersを組み立て
  const params = new URLSearchParams();
  for (let [key, value] of Object.entries(config.params || {})) {
    params.append(key, `${value}`);
  }

  const isAuth = config.url === '/auth/login' || config.url === '/auth/refresh';

  let res: Response;
  try {
    res = await fetch(
      `${baseURL}${config.url}${params.size > 0 ? `?${params}` : ''}`,
      {
        method: config.method,
        headers: {
          'X-Requested-With': 'xhr',
          Authorization: isAuth ? '' : `Bearer ${await getAccessToken()}`,
          apiKey:
            DATA_TRANSPORT_API_BASE_URL && DATA_TRANSPORT_API_KEY
              ? DATA_TRANSPORT_API_KEY
              : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config.data),
        signal: config.signal || getSignal()
      }
    );
  } catch (e) {
    // ネットワークエラー
    if (e instanceof TypeError) {
      throw new NetworkError(e.message);
    }
    // その他のエラー
    throw e;
  }

  // APIエラーハンドリング
  if (res && !res.ok) {
    const body = (await res.json()) as DataTransportApiErrorModels;
    throw new DataTransportAPIError(res.status, body);
  }

  if (res.status === 204) {
    return {
      res: undefined as ResponseData<Path, Method, Status>,
      headers: res.headers,
      status: res.status,
    };
  }

  return {
    res: (await res.json()) as ResponseData<Path, Method, Status>,
    headers: res.headers,
    status: res.status,
  };
}

function getNext(headers: Headers) {
  return headers
    .get('Link')
    ?.match(/after=([a-z|0-9|-]{36})/) // LinkヘッダーがURLで返ってくるのでafter=の後ろだけ抜き出す
    ?.at(1);
}

export const dataTransportApiClient = {
  // ユーザ当人認証
  async login(data: RequestData<'/auth/login', 'post'>) {
    const { res } = await fetchFromDataTransport({
      url: '/auth/login',
      method: 'post',
      data,
      status: '201',
    });
    return res;
  },
  // アクセストークン情報更新
  async refreshAccessToken(data: RequestData<'/auth/refresh', 'post'>) {
    const { res } = await fetchFromDataTransport({
      url: '/auth/refresh',
      method: 'post',
      data,
      status: '201',
    });
    return res;
  },
  // #2 事業者情報取得
  async getOperatorByOpenOperatorId(openOperatorId?: string) {
    const { res } = await fetchFromDataTransport({
      url: '/api/v1/authInfo' as '/api/v1/authInfo?dataTarget=operator',
      params:
        openOperatorId === undefined
          ? { dataTarget: 'operator' }
          : { dataTarget: 'operator', openOperatorId },
      method: 'get',
    });
    return res;
  },
  // # 3 事業所情報更新
  async putPlants(req: PlantModel) {
    const { res } = await fetchFromDataTransport({
      url: '/api/v1/authInfo' as '/api/v1/authInfo?dataTarget=plant',
      method: 'put',
      params: { dataTarget: 'plant' },
      data: req,
      status: '201',
    });
    return res;
  },
  // #4 事業所一覧取得
  async getPlants() {
    const { res } = await fetchFromDataTransport({
      url: '/api/v1/authInfo?dataTarget=plant',
      method: 'get',
    });
    return res;
  },
  /**
   * #8 事業者部品一覧取得
   * @param parentFlag 親部品のみ取得する場合はtrueを指定する
   */
  async getParts(
    {
      traceId,
      parentFlag,
      limit,
      after,
    }: {
      traceId?: string;
      after?: string;
      parentFlag?: boolean;
      limit: number;
    },
    signal?: AbortSignal // AbortSignalを受け取る
  ) {
    const { res, headers } = await fetchFromDataTransport({
      url: '/api/v1/datatransport' as '/api/v1/datatransport?dataTarget=parts',
      params: {
        dataTarget: 'parts',
        ...(traceId && { traceId }),
        ...(parentFlag && { parentFlag }),
        ...(after && { after }),
        limit,
      },
      method: 'get',
      signal,
    });
    const next = getNext(headers);
    return { res, next };
  },
  // #19 部品情報削除
  async deleteParts(traceId: string) {
    await fetchFromDataTransport({
      url: `/api/v1/datatransport?dataTarget=parts&traceId=${traceId}` as
        '/api/v1/datatransport?dataTarget=parts&traceId={uuid}',
      method: 'delete',
      status: '204',
    });
  },

  // #6 部品構成情報一覧更新
  async putPartsStructure(req: PartsStructureModel) {
    const { res } = await fetchFromDataTransport({
      url: '/api/v1/datatransport?dataTarget=partsStructure',
      method: 'put',
      data: req,
      status: '201',
    });
    return res;
  },
  // #7 取引関係依頼情報更新
  async putTradeRequests(req: TradeRequestModel) {
    const { res } = await fetchFromDataTransport({
      url: '/api/v1/datatransport?dataTarget=tradeRequest',
      method: 'put',
      data: req,
      status: '201',
    });
    return res;
  },
  // #9 部品構成情報一覧取得
  async getPartsStructure(traceId: string) {
    const { res } = await fetchFromDataTransport({
      url: `/api/v1/datatransport?dataTarget=partsStructure&traceId=${traceId}` as '/api/v1/datatransport?dataTarget=partsStructure&traceId={uuid}',
      method: 'get',
    });
    return res;
  },
  // #10 取引依頼情報一覧取得
  async getTradeRequests(traceIds: string[]) {
    const API_TRACEIDS_LIMIT = 50;

    return callApiByChunks(
      traceIds,
      API_TRACEIDS_LIMIT,
      async (traceIdsString) => {
        const { res } = await fetchFromDataTransport({
          url: '/api/v1/datatransport' as '/api/v1/datatransport?dataTarget=tradeRequest',
          method: 'get',
          params: {
            dataTarget: 'tradeRequest',
            traceIds: traceIdsString,
          },
        });
        return res;
      }
    );
  },
  // #11 依頼・回答情報一覧取得
  async getTradeStatus({ traceId }: { traceId?: string; }) {
    const { res } = await fetchFromDataTransport({
      url: '/api/v1/datatransport' as '/api/v1/datatransport?dataTarget=status',
      params: {
        dataTarget: 'status',
        ...(traceId && { statusTarget: 'REQUEST' }),
        ...(traceId && { traceId }),
      },
      method: 'get',
    });
    return res.at(0);
  },
  // #12 取引関係回答情報一覧取得
  async getTradeResponse({ limit, after }: { limit?: number; after?: string; }) {
    const { res, headers } = await fetchFromDataTransport({
      url: '/api/v1/datatransport' as '/api/v1/datatransport?dataTarget=tradeResponse',
      params: {
        dataTarget: 'tradeResponse',
        limit: limit ?? 100,
        ...(after && { after }),
      },
      method: 'get',
    });
    const next = getNext(headers);
    return { res, next };
  },
  // #13 取引関係回答情報更新
  async putTradeResponse({
    tradeId,
    traceId,
  }: {
    tradeId: string;
    traceId: string;
  }) {
    const { res } = await fetchFromDataTransport({
      url: `/api/v1/datatransport?dataTarget=tradeResponse&tradeId=${tradeId}&traceId=${traceId}` as '/api/v1/datatransport?dataTarget=tradeResponse&tradeId={uuid}&traceId={uuid}',
      method: 'put',
      status: '201',
    });
    return res;
  },
  // #14 CFP情報一覧取得
  async getCfpsByTraceIds(traceIds: string[], signal?: AbortSignal) {
    const API_TRACEIDS_LIMIT = 50;  // リクエストパラメータに一度に指定できるトレース識別子の最大数

    // NOTE: 当アプリケーション開発時点では、APIを並列で呼ぶと過負荷状態となる制約があったため、直列で実行している
    // 制約が解かれれば並列実行が望ましい

    return callApiByChunks(
      traceIds,
      API_TRACEIDS_LIMIT,
      async (traceIdsString) => {
        const { res } = await fetchFromDataTransport({
          url: `/api/v1/datatransport?dataTarget=cfp&traceIds=${traceIdsString}` as '/api/v1/datatransport?dataTarget=cfp&traceIds={uuid}',
          method: 'get',
          signal,
        });
        return res;
      }
    );
  },
  // #15 CFP情報登録
  async putCfp(req: CfpModel[]) {
    const { res } = await fetchFromDataTransport({
      url: '/api/v1/datatransport?dataTarget=cfp',
      method: 'put',
      data: req,
      status: '201',
    });
    return res;
  },
  // #16 依頼情報ステータスの変更（依頼取消・依頼差戻）
  async putTradeStatus(req: StatusModel) {
    const { status } = await fetchFromDataTransport({
      url: '/api/v1/datatransport?dataTarget=status',
      method: 'put',
      data: req,
      status: '201',
    });
    return status;
  },
  // #17 事業者情報一覧取得
  async getOperators(operatorIds: string[]) {
    const API_OPERATORIDS_LIMIT = 100;
    return callApiByChunks(
      operatorIds,
      API_OPERATORIDS_LIMIT,
      async (_operatorIds) => {
        const { res } = await fetchFromDataTransport({
          url: `/api/v1/authInfo?dataTarget=operator&operatorIds=${_operatorIds}` as '/api/v1/authInfo?dataTarget=operator&operatorIds={uuid}',
          method: 'get',
        });
        return res;
      }
    );
  },

  // #18 CFP証明書情報取得
  async getCfpCertification(
    traceId: string
  ): Promise<CfpCertificationModel | undefined> {
    const { res } = await fetchFromDataTransport({
      url: `/api/v1/datatransport?dataTarget=cfpCertification&traceId=${traceId}` as '/api/v1/datatransport?dataTarget=cfpCertification&traceId={uuid}',
      method: 'get',
    });
    // APIのレスポンスは1件のみの配列 or 空配列で返ってくる
    return res.at(0);
  },
};

// APIの並列呼び出しでエラーが発生するため直列に実行する
async function callApiByChunks<Res>(
  ids: string[],
  chunkSize: number,
  api: (id: string) => Promise<Res[]>
): Promise<Res[]> {
  let result = [];
  for (let chunk of splitArrayIntoChunks(ids, chunkSize)) {
    const id = chunk.join(',');
    result.push(await api(id));
  }
  return result.flat(1);
}
