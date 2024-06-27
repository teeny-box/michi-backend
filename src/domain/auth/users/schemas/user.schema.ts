import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/database/abstract.schema';
import { Role, State } from '@/common/enums/user.enum';

@Schema({ timestamps: true, versionKey: false })
export class User extends AbstractDocument {
  @Prop({ type: String, required: true, index: true, unique: true })
  userId: string;

  @Prop({ type: String, required: true, index: true, unique: true })
  nickname: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: true })
  userName: string;

  @Prop({ type: String, required: true })
  birthYear: string;

  @Prop({ type: String, required: true })
  phoneNumber: string;

  @Prop({ type: String, default: null })
  profileImage: string;

  @Prop({ type: String, enum: Role, required: true, default: Role.USER })
  role: Role;

  @Prop({ type: String, enum: State, required: true, default: State.JOINED })
  state: State;

  @Prop({ type: String, default: null })
  fcmToken?: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
