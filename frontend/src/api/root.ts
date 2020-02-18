import { ACCESS_TOKEN_LOCAL_STORAGE_KEY,
         REFRESH_TOKEN_LOCAL_STORAGE_KEY } from '../constants';


type RequestOpts = Partial<RequestInit>;


class BaseAPI {
  protected static apiProtocol = process.env.REACT_APP_API_PROTOCOL || "https";
  protected static apiDomain = process.env.REACT_APP_API_DOMAIN;

  protected static baseRequestOptions: RequestOpts = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    redirect: "follow",
    credentials: "include"
  }

  protected static async wrapFetch(url: string, options: RequestOpts) {
    const res = await fetch(
      `${this.apiProtocol}://${this.apiDomain}${url}`,
      options
    );
    if (!res.ok) {
      return Promise.reject(res)
    }
    return await res.json();
  }

  protected static async makeRequestOptions(
    method: "GET" | "POST",
    options: RequestOpts
  ): Promise<RequestOpts> {
    return {
      ...this.baseRequestOptions,
      ...options,
      method
    }
  };

  public static async get(
    url: string,
    options: RequestOpts = {}
  ) {
    const opts = await this.makeRequestOptions("GET", options)
    return this.wrapFetch(url, opts);
  }

  public static async post(
    url: string,
    body: object,
    options: RequestOpts = {}
  ) {
    const opts = await this.makeRequestOptions("POST", {
      ...options,
      body: JSON.stringify(body)
    })
    return this.wrapFetch(url, opts);
  }
}


export default class RootAPI extends BaseAPI {
  protected static async makeRequestOptions(
    method: "GET" | "POST",
    options: RequestOpts
  ): Promise<RequestOpts> {
    let baseOpts = await super.makeRequestOptions(method, options);
    const accessToken = await this.getAccessToken();
    if (accessToken) {
      baseOpts = {
        ...baseOpts,
        headers: {
          ...baseOpts.headers,
          Authorization: `Bearer ${accessToken}`
        }
      }
    }
    return baseOpts;
  }

  private static async getAccessToken(): Promise<string | null> {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
    return accessToken || null;
  }

  protected static async wrapFetch(url: string, options: RequestOpts) {
    try {
      return await super.wrapFetch(url, options);
    } catch(res) {
      if (res.status === 401) {
        localStorage.removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)
        localStorage.removeItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
      }
      return Promise.reject(res)
    }
  }
}

export class AuthAPI extends BaseAPI {
  protected static apiDomain = process.env.REACT_APP_AUTH_DOMAIN;
}
