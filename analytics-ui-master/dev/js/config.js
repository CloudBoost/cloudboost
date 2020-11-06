let globals = () => {
    return {
        dashboardAPI: USER_SERVICE_URL,
        analyticsAPI: ANALYTICS_URL,
        accountsURL: ACCOUNTS_URL,
        cloudBoostAPI: SERVER_URL
    }
};

let config = globals();

module.exports = config;