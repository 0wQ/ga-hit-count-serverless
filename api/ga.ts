import { NowRequest, NowResponse } from '@vercel/node'
import { google } from 'googleapis'
import config from './_config'

/**
 * Blog hit count. Served by Google Analytics
 */
export default async (req: NowRequest, resp: NowResponse) => {
  // API query page parameter
  const hostname = req.query.hostname || config.hostname
  const { page = '' } = req.query

  // page path filter
  const filter =
    page === ''
      ? { dimensionName: 'ga:pagePath', operator: 'BEGINS_WITH', expressions: config.allFilter }
      : {
        dimensionName: 'ga:pagePath',
        operator: 'EXACT',
        expressions: [page] as string[],
      }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      private_key: config.auth.privateKey,
      client_email: config.auth.clientEmail,
    },
    projectId: config.auth.projectId,
    scopes: 'https://www.googleapis.com/auth/analytics.readonly',
  })
  const client = await auth.getClient()
  const analyticsreporting = google.analyticsreporting({
    version: 'v4',
    auth: client,
  })

  const gaReport = await analyticsreporting.reports.batchGet({
    requestBody: {
      reportRequests: [
        {
          viewId: config.viewId,
          dateRanges: [
            {
              startDate: config.startDate,
              endDate: 'today',
            },
          ],
          metrics: [
            {
              expression: 'ga:pageviews',
            },
          ],
          dimensions: [
            {
              name: 'ga:pagePath',
            },
            {
              name: 'ga:hostname',
            },
          ],
          dimensionFilterClauses: [{
            operator: 'AND',
            filters: [
              filter,
              {
                'dimensionName': 'ga:hostname',
                'operator': 'EXACT',
                'expressions': [hostname] as string[],
              }
            ],
          }],
          orderBys: [
            {
              fieldName: 'ga:pageviews',
              sortOrder: 'DESCENDING',
            },
          ],
        },
      ],
    },
  })
  const report = gaReport.data.reports[0].data

  let res = []
  if (report.totals[0].values[0] === '0') {
    res = [{ page: page, hit: '0' }]
  } else {
    report.rows.forEach(r => {
      // Remove all pages with querys
      if (!r.dimensions[0].includes('?')) {
        res.push({ page: r.dimensions[0], hit: r.metrics[0].values[0] })
      }
    })
  }

  resp.setHeader('Access-Control-Allow-Origin', '*')
  resp.setHeader('Cache-Control', 'public, max-age=120, s-maxage=300, stale-while-revalidate')
  resp.status(200).send(res)
}
