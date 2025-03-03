import { components } from '@/api/schemas/traceability';
import { Get } from 'type-fest';

type Components = Get<components, 'schemas'>;
export type TraceabilityApiErrorModel = Components['ValidationError'];

export type NotificationGetResource = Components['NotificationGetResource'];
export type NotificationModel = Components['NotificationGetResourceItem'];
export type FileUploadUrlPostRequest = Components['FileUploadUrlPostRequest'];
export type ReplyMessagesPostRequest = Components['ReplyMessagesPostRequest'];
