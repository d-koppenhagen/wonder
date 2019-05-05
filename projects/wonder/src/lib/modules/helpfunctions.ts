function uuid4(): string {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

export function guid(): string {
  return uuid4() + uuid4() + '-' + uuid4() + '-' + uuid4() + '-' + uuid4() + '-' + uuid4() + uuid4() + uuid4();
}

export function errorHandler(error) {
  console.log(error);
}
