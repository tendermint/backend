require('dotenv').config()

const axios = require('axios');
const algoliasearch = require('algoliasearch');

const ADMIN_API_KEY = process.env.ALGOLIA_ADMIN_API_KEY

const client = algoliasearch('ME7376U3XW', ADMIN_API_KEY);

/**
 * Uncheck temp_apps index for debugging purpose.
 */
// const index = client.initIndex('temp_apps');
const index = client.initIndex('apps');

exports.updateAppsIndex = async function() {
  axios({
    url: "https://backend.tendermint.com/apps"
  }).then(res => {
    const records = []

    res.data.records.forEach(rec => {
      /**
       * Filter apps that are marked as active and not deprecated.
       */
      if (rec.fields.active && rec.fields.status !== "Deprecated") {
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

  console.log("Done - Updated Apps index! ")
}