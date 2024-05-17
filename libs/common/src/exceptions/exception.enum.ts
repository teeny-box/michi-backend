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
  USER_FORBIDDEN = '1030',
  USER_WITHDRAWN = '1031',
}
