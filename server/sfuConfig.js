/**
 * Configuration for Mediasoup SFU
 */

let config = {
  loglevel: 'warn',
  logTags: [
    'info',
    'ice',
    'dtls',
    'rtp',
    'srtp',
    'rtcp'
  ],
  rtcIPv4: true,
  rtcIPv6: true,
  rtcAnnouncedIPv4: null,
  rtcAnnouncedIPv6: null,
  rtcMinPort: 40000,
  rtcMaxPort: 49999,
  maxBitrate: 64000
}

config.mediaCodecs = [
  {
    kind: 'audio',
    name: 'opus',
    clockRate: 48000,
    channels: 2,
    parameters: {
      useinbandfec: 1
    }
  }
]

module.exports = config
