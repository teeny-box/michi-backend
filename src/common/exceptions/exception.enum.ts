export enum UncatchedExceptionEnum {
  UNCATCHED = '9999',
}

export enum UserExceptionEnum {
  USER_BAD_REQUEST = '0000',
  USER_ID_DUPLICATE = '0001',
  USER_NICKNAME_DUPLICATE = '0002',
  USER_NOT_FOUND = '0040',
}

export enum AuthExceptionEnum {
  USER_UNAUTHORIZED = '1010',
  NOT_EXPIRED_ACCESS_TOKEN = '1011',
  INVALID_TOKEN = '1012',
  PASSWORD_MISMATCH = '1013',
  NO_TOKEN_PROVIDED = '1014',
  USER_FORBIDDEN = '1030',
  USER_WITHDRAWN = '1031',
  USER_CONFLICT = '1090',
}

export enum ChatroomExceptionEnum {
  CHATROOM_BAD_REQUEST = '2000',
  NOT_ENOUGH_USER_IN_CHAT_QUEUE = '2001',
  CHATROOM_NOT_FOUND = '2040',
}

export enum PostExceptionEnum {
  POST_FORBIDDEN = '3030',
  POST_NOT_FOUND = '3040',
}

export enum FirebaseExceptionEnum {
  UNSUBSCRIBE_FAILED = '4000',
  SUBSCRIBE_FAILED = '4001',
}

export enum DeviceExceptionEnum {
  USER_DEVICE_NOT_FOUND = '5040',
}
