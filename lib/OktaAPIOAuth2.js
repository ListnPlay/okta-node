/*
 *  Created by kevin.he on 11/4/2014
 *
 *  Contains the User functions that were originally in 
 *  OktaAPI, now is here for better organization
 *
 */

/*
 * Okta User Documentation
 * http://developer.okta.com/docs/api/rest/users.html
 */
var NetworkAbstraction = require('./NetworkAbstraction.js');

module.exports = OktaAPIOAuth2;

/**
 * Instantiate a new Okta API OAuth2 helper with the given API token
 * @param apiToken
 * @param domain
 * @param preview
 * @constructor
 */

function OktaAPIOAuth2(apiToken, clientId, clientSecret, domain, preview)
{
    if(clientId == undefined || clientSecret == undefined) {
        throw new Error("OktaAPI requires an clientid, clientsecert");
    }
    this.domain = domain.replace("-admin", "");
    this.preview = preview || false
    this.request = new NetworkAbstraction(apiToken, clientId, clientSecret, this.domain, this.preview, "Basic", "oauth2");
    this.helpers = require('./OktaAPIUsersHelpers.js');
}



/*******************************************************************
************************ OAuth2->Oauth2Ops Start **********************
********************************************************************
*/

/**
 * Get Token From Code
 * @method getTokenFromCode
 * @param data {redirect_uri: http://..., code: ****}
 * @param callback
 */
OktaAPIOAuth2.prototype.getTokenFromCode = function(data, callback)
{
    this.request.postForm("token", {grant_type: 'authorization_code', redirect_uri: data.redirect_uri, code: data.code}, null, callback);
}

/**
 * User Info
 * @method userInfo
 * @param code
 * @param callback
 */
OktaAPIOAuth2.prototype.userInfo = function(tokenCode, tokenType, callback)
{
    let req = new NetworkAbstraction(tokenCode, null, null, this.domain, this.preview, tokenType, "oauth2");
    req.get("userinfo", null, true, callback);
}
