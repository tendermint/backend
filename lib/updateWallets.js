require('dotenv').config()

const axios = require('axios');
const algoliasearch = require('algoliasearch');

const ADMIN_API_KEY = process.env.ALGOLIA_ADMIN_API_KEY

const client = algoliasearch('ME7376U3XW', ADMIN_API_KEY);

/**
 * Uncheck temp_wallets index for debugging purpose.
 */
// const index = client.initIndex('temp_wallets');
const index = client.initIndex('wallets');

exports.updateWalletsIndex = async function() {
  axios({
    url: "https://backend.tendermint.com/wallets"
  }).then(res => {
    const records = []

    res.data.records.forEach(rec => {
      /**
       * Filter wallets that are marked as active
       */
      if (rec.fields.active) {
        records.push(rec.fields)
      }
    })

    // Ref: https://www.algolia.com/doc/api-reference/api-methods/replace-all-objects
    index.replaceAllObjects(records, {
      autoGenerateObjectIDIfNotExist: true
    })
    /**
     * Uncheck for debug purpose
     */
    // .then(({ objectIDs }) => {
    //   console.log(objectIDs)
    // })
    .catch(error => console.log(error))
  })

  console.log("Done - Updated Wallets index!")
}