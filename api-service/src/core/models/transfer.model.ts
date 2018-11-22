export interface TransferModel<T> {
  type: string;
  serviceId: string;
  data: T;
}
