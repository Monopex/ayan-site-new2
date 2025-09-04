export default defineEventHandler(async (event) => {
  const androidJson = [{
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'com.ayan.ayanmarket',
      sha256_cert_fingerprints:
          ['96:A7:AB:29:66:BE:B9:FE:11:B5:CB:15:9B:28:A7:A9:7A:9E:81:09:AF:BD:D8:61:A9:91:4A:93:29:57:32:14']
    }
  }]

  setHeader(event, 'Content-Type', 'application/json')
  return androidJson
})
