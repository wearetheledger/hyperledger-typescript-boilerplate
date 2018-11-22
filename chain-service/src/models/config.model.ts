export interface ConfigOptions {
  hlf: HlfConfigOptions;
  allowguest: boolean;
}

export interface AdminCreds {
  enrollmentID: string;
  enrollmentSecret: string;
  MspID: string;
}

export interface TLSOptions {
  trustedRoots: Array<any>;
  verify: boolean;
}

export interface HlfConfigOptions {
  walletPath: string;
  userId: string;
  channelId: string;
  chaincodeId: string;
  networkUrl: string;
  eventUrl: string;
  ordererUrl: string;
  caUrl: string;
  admin: AdminCreds;
  tlsOptions: TLSOptions;
  caName: string;
}
