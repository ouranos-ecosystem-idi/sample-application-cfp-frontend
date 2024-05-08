import { paths } from '@/api/schemas/traceability';
import { getAccessToken } from '@/api/accessToken';
import { UnionToIntersection, Get } from 'type-fest';
import { TraceabilityApiErrorModel } from '@/api/models/traceability';
import { traceabilityAPIError } from '@/api/apiErrors';
import { NetworkError } from '@/api/networkErrors';
import { getSignal } from '@/components/template/AbortHandler';

type UrlPaths = keyof paths;

type HttpMethods = keyof UnionToIntersection<paths[keyof paths]>;

type HttpStatus = '200' | '201';

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
> = RequestData<Path, Method> extends object
  ? {
    // リクエストがapplication/jsonの場合
    url: Path;
    method: Method & HttpMethodsFilteredByPath<Path>;
    params?: RequestParameters<Path, Method>;
    data?: RequestData<Path, Method>;
    body?: undefined;
    headers?: HeadersInit;
    status?: Status;
    signal?: AbortSignal;
  }
  : {
    // application/json以外の場合。data/body以外は上と同じにする
    url: Path;
    method: Method & HttpMethodsFilteredByPath<Path>;
    params?: RequestParameters<Path, Method>;
    data?: undefined;
    body?: BodyInit;
    headers?: HeadersInit;
    status?: Status;
    signal?: AbortSignal;
  };

const TRACEABILITY_API_BASE_URL =
  process.env.NEXT_PUBLIC_TRACEABILITY_API_BASE_URL;
const TRACEABILITY_API_KEY = process.env.NEXT_PUBLIC_TRACEABILITY_API_KEY;

// let globalAbortController = new AbortController();

async function fetchBody<
  Path extends UrlPaths,
  Method extends HttpMethods,
  Status extends HttpStatus = '200'
>(config: FetchConfigWrapper<Path, Method, Status>) {
  let baseURL = '';
  if (TRACEABILITY_API_BASE_URL) {
    baseURL = TRACEABILITY_API_BASE_URL.replace(/(.+)\/$/, '$1');
  }

  // URL Parametersを組み立て
  const params = new URLSearchParams();
  for (let [key, value] of Object.entries(config.params || {})) {
    params.append(key, `${value}`);
  }

  let res: Response;
  try {
    res = await fetch(
      baseURL.concat(config.url).concat(params.size > 0 ? '?' : '') + params,
      {
        method: config.method,
        headers: {
          'X-Requested-With': 'xhr',
          Authorization: `Bearer ${await getAccessToken()}`,
          'x-api-key':
            TRACEABILITY_API_BASE_URL && TRACEABILITY_API_KEY
              ? TRACEABILITY_API_KEY
              : '',
          ...(config.data !== undefined && {
            'Content-Type': 'application/json',
          }),
        },
        body:
          config.data !== undefined ? JSON.stringify(config.data) : config.body,
        signal: config.signal || getSignal(),
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
    const body = (await res.json()) as TraceabilityApiErrorModel;
    throw new traceabilityAPIError(res.status, body);
  }
  return res;
}

async function fetchFromTraceability<
  Path extends UrlPaths,
  Method extends HttpMethods,
  Status extends HttpStatus = '200'
>(config: FetchConfigWrapper<Path, Method, Status>) {
  const res = await fetchBody(config);
  return {
    res: (await res.json()) as ResponseData<Path, Method, Status>,
    headers: res.headers,
    status: res.status,
  };
}

async function rawFetchFromTraceability<
  Path extends UrlPaths,
  Method extends HttpMethods,
  Status extends HttpStatus = '200'
>(config: FetchConfigWrapper<Path, Method, Status>) {
  const res = await fetchBody(config);
  return {
    res: res,
    headers: res.headers,
  };
}

export const traceabilityApiClient = {
  // 【CFP情報開示設定登録API】
  async postCfpAcl(data: {
    operatorId: string;
    releasedToOperatorId: string;
    traceId: string;
  }) {
    const { res } = await fetchFromTraceability({
      url: '/cfpAcl',
      method: 'post',
      data: {
        ...data,
        acl: [
          {
            aclItemGroup: 'TOTALCFP',
            releasedFlag: true,
          },
          {
            aclItemGroup: 'TOTALDQR',
            releasedFlag: true,
          },
        ],
      },
    });
    return res;
  },

  // 【CFP証明書情報開示設定登録API】
  async postCfpCertificationAcl(data: {
    operatorId: string;
    releasedToOperatorId: string;
    traceId: string;
  }) {
    const { res } = await fetchFromTraceability({
      url: '/cfpCertificationAcl',
      method: 'post',
      data: {
        ...data,
        releasedFlag: true,
      },
    });
    return res;
  },

  // 【通知情報検索API】
  async getNotifications({
    operatorId,
    notifiedAtFrom,
    notifiedAtTo,
    after,
  }: {
    operatorId: string;
    notifiedAtFrom?: string;
    notifiedAtTo?: string;
    after?: string;
  }) {
    const { res } = await fetchFromTraceability({
      url: '/notifications',
      method: 'get',
      params: {
        operatorId,
        ...(notifiedAtFrom && { notifiedAtFrom }),
        ...(notifiedAtTo && { notifiedAtTo }),
        ...(after && { after }),
      },
    });
    return res;
  },

  // 【CFP証明書登録API】
  async postCfpCertifications(data: {
    operatorId: string;
    traceId: string;
    cfpCertificationId?: string;
    cfpCertificationDescription?: string;
    cfpCertificationFiles: File[];
  }) {
    const form = new FormData();
    form.append('operatorId', data.operatorId);
    form.append('traceId', data.traceId);
    if (data.cfpCertificationId !== undefined) {
      form.append('cfpCertificationId', data.cfpCertificationId);
    }
    if (data.cfpCertificationDescription !== undefined) {
      form.append(
        'cfpCertificationDescription',
        data.cfpCertificationDescription
      );
    }
    data.cfpCertificationFiles.map((file) => {
      form.append('cfpCertificationFiles', file);
    });
    const { status } = await fetchFromTraceability({
      url: '/cfpCertifications',
      method: 'post',
      body: form,
    });
    return status;
  },

  // 【CFP証明書ファイルダウンロードAPI】
  async getCfpCertificationFiles(data: {
    operatorId: string;
    fileOperatorId: string;
    fileId: string;
    downloadType: 'OWN' | 'OTHER';
    cfpCertificationId: string;
  }) {
    const { res } = await rawFetchFromTraceability({
      url: '/cfpCertificationFiles',
      method: 'get',
      params: data,
    });
    return (await res.blob()).text(); // utf-8でstringにする
  },
};
