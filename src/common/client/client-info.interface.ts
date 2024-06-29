import { OsType } from '@/common/enums/os-type.enum';
import { AppType } from '@/common/enums/app-type.enum';

export interface ClientInfo {
  osType: OsType;
  osVersion?: string;
  appType?: AppType;
  appVersion?: string;
  deviceId?: string;
  deviceModel?: string;
}
