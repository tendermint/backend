require('dotenv').config()

const { updateAppsIndex } = require('./lib/updateApps')
const { updateWalletsIndex } = require('./lib/updateWallets')

;(async () => {
  await updateAppsIndex()
  await updateWalletsIndex()
})()