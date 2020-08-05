/**
 * Google Analytics query configurations
 *
 * ! If you are deploying this with your own account
 * ! , then you will need to change this config file.
 * ! Don't put your privateKey inside this file directly!
 */
export default {
  viewId: process.env.VIEW_ID,
  auth: {
    projectId: process.env.PROJECT_ID,
    privateKey: process.env.PRIVATE_KEY,
    clientEmail: process.env.CLIENT_EMAIL,
  },
  allFilter: ['/'],
  startDate: '2010-01-01',
}
