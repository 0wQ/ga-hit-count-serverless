/**
 * Google Analytics query configurations
 *
 * ! If you are deploying this with your own account
 * ! , then you will need to change this config file.
 * ! Don't put your privateKey inside this file directly!
 */
export default {
  viewId: '225754855',
  auth: {
    projectId: 'airy-harbor-285514',
    privateKey: process.env.PRIVATE_KEY,
    clientEmail: 'mizore-blog@airy-harbor-285514.iam.gserviceaccount.com',
  },
  allFilter: ['/20'],
  startDate: '2010-01-01',
}
