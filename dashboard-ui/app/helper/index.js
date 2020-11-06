
export function makeUrlFromData (data) {
  return 'mongo mongodb://' + data.data.username + ':' + data.data.password + '@' + data.url + '/' + data.data.appId;
}

export function makeConnectionStringFromData (data) {
  return 'mongodb://' + data.data.username + ':' + data.data.password + '@' + data.url + '/' + data.data.appId;
}

export function makeServerUrlFromData (data) {
  return data.url;
}
