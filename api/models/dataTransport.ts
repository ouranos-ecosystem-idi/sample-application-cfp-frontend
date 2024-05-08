import { components } from '@/api/schemas/dataTransport';
import { Get } from 'type-fest';

type Components = Get<components, 'schemas'>;
export type DataTransportApiErrorModels =
  | DataTransportApi400ErrorModel
  | DataTransportApi401ErrorModel
  | DataTransportApi403ErrorModel
  | DataTransportApi404ErrorModel
  | DataTransportApi500ErrorModel
  | DataTransportApi503ErrorModel;
export type DataTransportApi400ErrorModel = Components['common.HTTP400Error'];
export type DataTransportApi401ErrorModel = Components['common.HTTP401Error'];
export type DataTransportApi403ErrorModel = Components['common.HTTP403Error'];
export type DataTransportApi404ErrorModel = Components['common.HTTP404Error'];
export type DataTransportApi500ErrorModel = Components['common.HTTP500Error'];
export type DataTransportApi503ErrorModel = Components['common.HTTP503Error'];

export type PartsModel = Components['traceability.PartsModel'];
export type PartsStructureModel =
  Components['traceability.PartsStructureModel'];
export type StatusModel = Components['traceability.StatusModel'];
export type TradeModel = Components['traceability.TradeModel'];
export type TradeRequestModel = Components['traceability.TradeRequestModel'];
export type TradeResponseModel = Components['traceability.TradeResponseModel'];
export type CfpModel = Components['traceability.CfpModel'];
export type OperatorModel = Components['traceability.OperatorModel'];
export type PlantModel = Components['traceability.PlantModel'];
export type CfpCertificationModel =
  Components['traceability.CfpCertificationModel'];
