import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/database/abstract.schema';
import { ClientInfo } from '@/common/client/client-info.interface';

@Schema({ timestamps: true, versionKey: false })
export class UserDevice extends AbstractDocument {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: Object, required: true })
  clientInfo: ClientInfo;

  @Prop({ type: String, required: true })
  fcmRegistrationToken: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean = false;
}

const UserDeviceSchema = SchemaFactory.createForClass(UserDevice);

UserDeviceSchema.index({ userId: 1, fcmRegistrationToken: 1 });

export { UserDeviceSchema };
