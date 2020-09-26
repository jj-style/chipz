import socketIO from 'socket.io-client';

import Constants from "expo-constants";
const { manifest } = Constants;

const api = (typeof manifest.packagerOpts === `object`) && manifest.packagerOpts.dev
  ? "http://" + manifest.debuggerHost.split(`:`).shift().concat(`:5000`)
  : `api.example.com`;

export const websocket = socketIO(api, {
    transports: ['websocket'],
    jsonp: false
}).connect();