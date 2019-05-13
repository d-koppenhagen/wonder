/**
 * @ignore
 */
function uuid4(): string {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

/**
 * @desc The function generates a unique id
 * @example 12345678-9ABC-DEF0-1234-56789ABCDEF0
 */
export function guid(): string {
  return uuid4() + uuid4() + '-' + uuid4() + '-' + uuid4() + '-' + uuid4() + '-' + uuid4() + uuid4() + uuid4();
}

/**
 * @desc This function logs errors
 */
export function errorHandler(error: any, errorCallback?: (error: any) => void) {
  if (errorCallback) {
    errorCallback(error);
  } else {
    throw new Error(error);
  }
}
