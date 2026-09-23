declare module "midtrans-client" {
  interface SnapConfig {
    isProduction?: boolean;
    serverKey?: string;
    clientKey?: string;
  }

  interface TransactionResult {
    token: string;
    redirect_url: string;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class Snap {
    constructor(config: SnapConfig);
    createTransaction(parameter: Record<string, any>): Promise<TransactionResult>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction: any;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class CoreApi {
    constructor(config: SnapConfig);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction: any;
  }

  const midtransClient: {
    Snap: typeof Snap;
    CoreApi: typeof CoreApi;
  };

  export default midtransClient;
}
