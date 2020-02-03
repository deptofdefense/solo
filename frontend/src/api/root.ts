export default class RootAPI {
  private static apiBaseUrl = process.env.REACT_APP_API_DOMAIN;

  private static baseOptions: Partial<RequestInit> = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    redirect: "follow"
  };

  private static async wrapFetch(url: string, options: Partial<RequestInit>) {
    const res = await fetch(`https://${this.apiBaseUrl}${url}`, options);
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    return await res.json();
  }

  public static async get(
    url: string,
    options: Partial<RequestInit> | undefined = undefined
  ) {
    return this.wrapFetch(url, {
      ...options,
      ...this.baseOptions,
      method: "GET"
    });
  }

  public static async post(
    url: string,
    body: object,
    options: Partial<RequestInit> | undefined = undefined
  ) {
    return this.wrapFetch(url, {
      ...options,
      ...this.baseOptions,
      body: JSON.stringify(body),
      method: "POST"
    });
  }
}
