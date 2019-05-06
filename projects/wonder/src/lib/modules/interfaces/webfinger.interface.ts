export interface IWebFinger {
  new (
    config: {
      webfist_fallback?: boolean;
      tls_only?: boolean
      uri_fallback?: boolean
      request_timeout?: number
    }
  );
  lookup(
    rtcIdentity: string,
    callback: (error: any, data: any) => void
  ): void;
}
