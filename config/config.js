module.exports = {
    appExpirationTimeFromCache: process.env['APP_EXPIRY_CACHE_TIME'] || 86400,
    cacheAppPrefix: process.env['CACHE_APP_PREFIX'] || 'app',
    cacheSchemaPrefix: process.env['CACHE_SCHEMA_PREFIX'] || 'schema',
    schemaExpirationTimeFromCache: process.env['SCHEMA_EXPIRY_CACHE_TIME'] || 86400,
    globalDb: process.env['GLOBAL_DB'] || '_GLOBAL',
    globalSettings: process.env['GLOBAL_SETTINGS'] || '_Settings',
    hostUrl: process.env['HOST_URL'] || 'http://localhost:4730',
    analyticsUrl: process.env['ANALYTICS_URL'],
    analyticsKey: process.env['ANALYTICS_KEY'],
    logToken: process.env['LOGGLY_TOKEN'],
    logglySubDomain: process.env['LOGGLY_SUBDOMAIN'],
    logglyTags: process.env['LOGGLY_TAGS'],
    slackWebHook: process.env['SLACK_WEBHOOK'],
    slackIconUrl: process.env['SLACK_ICON_URL'],
    slackChannel: process.env['SLACK_CHANNEL'],
    mongoDisconnected: false,
    port: process.env['PORT'] || 4730,
    env: process.env['NODE_ENV'] || 'development',
    smtp: {
        provider: process.env["MAIL_PROVIDER"],
        apiKey: process.env["MAIL_PROVIDER_API_KEY"],
        domain: process.env["DOMAIN"],
        fromEmail: process.env["FROM_EMAIL"],
        fromName: process.env["FROM_NAME"]
    }
};