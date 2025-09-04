export default defineEventHandler(async (event) => {
  const appleJson = {
    applinks: {
      apps: [],
      details: [{
        appID: 'S4NAVX5GLQ.com.ayan.ayanmarket',
        paths: ['*', '/', '/product/*', '/shop/collection/*']
      }]
    }
  }

  setHeader(event, 'Content-Type', 'application/json')
  return appleJson
})
