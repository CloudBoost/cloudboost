module.exports = {
  "provider"  : process.env["MAIL_PROVIDER"],	
  "apiKey"    : process.env["MAIL_PROVIDER_API_KEY"],
  "domain"    : process.env["DOMAIN"],
  "fromEmail" : process.env["FROM_EMAIL"],
  "fromName"  : process.env["FROM_NAME"] 
};