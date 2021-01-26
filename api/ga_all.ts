import { NowRequest, NowResponse } from '@vercel/node'
import { google } from 'googleapis'
import config from './_config'

/**
 * Blog hit count. Served by Google Analytics
 */
export default async (req: NowRequest, resp: NowResponse) => {
  // API query page parameter
  const { hostname = '' } = req.query

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
            {
              expression: 'ga:users',
            },
          ],
          dimensions: [
            {
              name: 'ga:hostname',
            },
          ],
          dimensionFilterClauses: [{
            filters: [
              {
                'dimensionName': 'ga:hostname',
                'operator': 'EXACT',
                'expressions': [hostname || config.hostname] as string[],
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
    res = [{ hostname: hostname, hit: '0' }]
  } else {
    report.rows.forEach(r => {
      // Remove all pages with querys
      if (!r.dimensions[0].includes('?')) {
        res.push({ hostname: r.dimensions[0], hit: r.metrics[0].values[0], users: r.metrics[0].values[1] })
      }
    })
  }

  resp.setHeader('Access-Control-Allow-Origin', '*')
  resp.setHeader('Cache-Control', 'public, max-age=120, s-maxage=300, stale-while-revalidate')
  resp.status(200).send(res)
}
