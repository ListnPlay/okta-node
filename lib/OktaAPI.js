/**
 * Created by jjohnson on 12/9/13.
 * Updated by kevin.he on 10/29/2014, categories are correct as of this date
 *
 *  Originally contained all the functions for all the possible operations
 *  on the Okta API
 *
 *  Now just calls functions from other files to keep backwards capability
 *  Functions were split up into those files to have better organization
 *
 */
var NetworkAbstraction = require('./NetworkAbstraction.js');
var OktaAPIUsers = require('./OktaAPIUsers.js');
var OktaAPIOAuth2 = require('./OktaAPIOAuth2.js');
var OktaAPIGroups = require('./OktaAPIGroups.js');
var OktaAPISessions = require('./OktaAPISessions.js');
var OktaAPIApps = require('./OktaAPIApps.js');
var OktaAPIEvents = require('./OktaAPIEvents.js');

module.exports = OktaAPI;
/**
 * Instantiate a new Okta API session with the given API token
 * @param apiToken
 * @param domain
 * @param preview
 * @constructor
 */
function OktaAPI(apiToken, clientId, clientSecret, domain, preview) {
    preview = preview || false
    apiToken = apiToken || ""
    clientId = clientId || ""
    clientSecret = clientSecret || ""
    domain = domain || ""

    this.users = new OktaAPIUsers(apiToken, clientId, clientSecret, domain, preview);
    this.oauth2 = new OktaAPIOAuth2(apiToken, clientId, clientSecret, domain, preview)
    this.groups = new OktaAPIGroups(apiToken, clientId, clientSecret, domain, preview);
    this.sessions = new OktaAPISessions(apiToken, clientId, clientSecret, domain, preview);
    this.apps = new OktaAPIApps(apiToken, domain, clientId, clientSecret, preview);
    this.events = new OktaAPIEvents(apiToken, clientId, clientSecret, domain, preview);
}
