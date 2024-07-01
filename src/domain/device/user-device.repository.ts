import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@/database/abstract.repository';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { UserDevice } from '@/domain/device/schemas/user-device.schema';

@Injectable()
export class UserDeviceRepository extends AbstractRepository<UserDevice> {
  protected readonly logger = new Logger(UserDeviceRepository.name);

  constructor(
    @InjectModel(UserDevice.name) userDeviceModel: Model<UserDevice>,
    @InjectConnection() connection: Connection,
  ) {
    super(userDeviceModel, connection);
  }
}
