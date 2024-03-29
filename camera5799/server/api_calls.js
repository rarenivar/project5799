/**
 * @author Ramiro Arenivar
 * For CSCI 5799
 */

// needed for self signed certificate
// link... https://github.com/meteor/meteor/issues/2866
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// needed to make mobile build work
BrowserPolicy.content.allowOriginForAll("http://meteor.local");
BrowserPolicy.content.allowOriginForAll("*");
Future = Npm.require('fibers/future');

Meteor.methods({

    'userInfo': function(username, token) {

        var myFuture = new Future();
        check(username, String);
        check(token, String);
        token = 'Bearer ' + token;
        var apiUrl = 'https://ec2-52-37-126-44.us-west-2.compute.amazonaws.com:9000/users/' + username;
        var response = null;
        // query the API
        //var response = HTTP.get(apiUrl).data;
        HTTP.call("GET", apiUrl,
            { headers: { 'Authorization': token} },
            function (error, result) {
                if (!error) {
                    myFuture.return(result);
                } else {
                    myFuture.return(error.response);
                    //myFuture.throw(error);
                }
            });
        return myFuture.wait();
    },

    'editUserInfo': function(username, token, userObj) {

        var myFuture = new Future();
        check(username, String);
        check(token, String);
        check(userObj, {
            firstName: String,
            lastName: String,
            password: String
        });
        token = 'Bearer ' + token;
        var apiUrl = 'https://ec2-52-37-126-44.us-west-2.compute.amazonaws.com:9000/users/' + username;
        var response = null;
        // query the API
        //var response = HTTP.get(apiUrl).data;
        HTTP.call("PUT", apiUrl,
            { data: userObj, headers: { 'Authorization': token} },
            function (error, result) {
                if (!error) {
                    myFuture.return(result);
                } else {
                    myFuture.return(error.response);
                    //myFuture.throw(error);
                }
            });
        return myFuture.wait();
    },

    'deleteUser': function(username, token) {

        var myFuture = new Future();
        check(username, String);
        check(token, String);
        token = 'Bearer ' + token;
        var apiUrl = 'https://ec2-52-37-126-44.us-west-2.compute.amazonaws.com:9000/users/' + username;
        var response = null;
        // query the API
        //var response = HTTP.get(apiUrl).data;
        HTTP.call("DELETE", apiUrl,
            { headers: { 'Authorization': token } },
            function (error, result) {
                if (!error) {
                    myFuture.return(result);
                } else {
                    myFuture.return(error.response);
                    //myFuture.throw(error);
                }
            });
        return myFuture.wait();
    },

    // The method expects a valid IPv4 address
    'loginCall': function (username, password) {
        // Construct the API URL
        var myFuture = new Future();
        check(username, String);
        check(password, String);
        var apiUrl = 'https://ec2-52-37-126-44.us-west-2.compute.amazonaws.com:9000/login';
        var response = null;
        // query the API
        //var response = HTTP.get(apiUrl).data;
        HTTP.call("POST", apiUrl,
            {data: {"username": username, "password": password}},
            function (error, result) {
                if (!error) {
                    /*var tokenValue = null;
                    if (result.hasOwnProperty('content')) {
                        tokenValue = result.content;
                        tokenValue = JSON.parse(tokenValue);
                        if (tokenValue.hasOwnProperty('Token')) {
                            tokenValue = tokenValue.Token;
                            myFuture.return(tokenValue);
                        }
                    }*/
                    myFuture.return(result);
                } else {
                    myFuture.return(error.response);
                    //myFuture.throw(error);
            }
        });
        return myFuture.wait();
    },

    'registerUser': function (username, firstName, lastName, password) {
        // Construct the API URL
        var myFuture = new Future();
        check(username, String);
        check(password, String);
        check(firstName, String);
        check(lastName, String);
        var apiUrl = 'https://ec2-52-37-126-44.us-west-2.compute.amazonaws.com:9000/register';

        HTTP.call("POST", apiUrl,
            {data: {"username": username, "password": password, "lastName": lastName, "firstName": firstName}},
            function (error, result) {
                if (!error) {
                    myFuture.return(result);
                } else {
                    myFuture.return(error.response);
                    //myFuture.throw(error);
                }
            });
        return myFuture.wait();
    },

    'getCameras': function (token, username) {
        var myFuture = new Future();
        check(token, String);
        check(username, String);
        token = 'Bearer ' + token;
        // TODO: add /username when it's implemented
        var apiURL = "https://ec2-52-37-126-44.us-west-2.compute.amazonaws.com:9000/cameras/" + username;

        HTTP.call("GET", apiURL,
            { headers: { 'Authorization': token} },
            function (error, result) {
                if (!error) {
                    myFuture.return(result);
                } else {
                    myFuture.throw(error);
                }
            });
        return myFuture.wait();
    },

    'getVideos': function (token, username) {
        var myFuture = new Future();
        check(token, String);
        check(username, String);
        token = 'Bearer ' + token;
        var apiURL = "https://ec2-52-37-126-44.us-west-2.compute.amazonaws.com:9000/videos/" + username;

        HTTP.call("GET", apiURL,
            { headers: { 'Authorization': token} },
            function (error, result) {
                if (!error) {
                    myFuture.return(result);
                } else {
                    myFuture.throw(error);
                }
            });
        return myFuture.wait();
    },

    'getLiveFeed': function (token) {

    },

    'saveFeed': function (token) {

    },

    'controlFeed': function (token) {

    },

    'deleteCamera': function(token, username, cameraName) {
        check(username, String);
        check(token, String);
        check(cameraName, String);

        // Construct the API URL
        var myFuture = new Future();

        var apiUrl = 'https://ec2-52-37-126-44.us-west-2.compute.amazonaws.com:9000/cameras/' + username + "/" + cameraName;
        HTTP.call("DELETE", apiUrl,
            {
                headers: { 'Authorization': token }
            },
            function (error, result) {
                if (!error) {
                    console.log("result... " + JSON.stringify(result));
                    myFuture.return(result);
                } else {
                    myFuture.return(error.response);
                    //myFuture.throw(error);
                }
            });
        return myFuture.wait();
    },

    'editCameraInformation': function (token, username, cameraName, cameraObj) {
        // check that the object we received is correct
        check( cameraObj, {
            name: String,
            location: String,
            url: String,
            username: String,
            password: String
        });
        check(username, String);
        check(token, String);
        check(cameraName, String);

        // Construct the API URL
        var myFuture = new Future();

        var apiUrl = 'https://ec2-52-37-126-44.us-west-2.compute.amazonaws.com:9000/cameras/' + username + "/" + cameraName;
        console.log("camera name... " + cameraName);
        HTTP.call("PUT", apiUrl,
            { data: cameraObj,
                headers: { 'Authorization': token, 'Content-Type': 'application/json' }
            },
            function (error, result) {
                if (!error) {
                    console.log("result... " + JSON.stringify(result));
                    myFuture.return(result);
                } else {
                    myFuture.return(error.response);
                    //myFuture.throw(error);
                }
            });
        return myFuture.wait();
    },

    'registerCamera': function (token, username, registerObj) {

        // check that the object we received is correct
        check( registerObj, {
            name: String,
            location: String,
            url: String,
            username: String,
            password: String
        });
        check(username, String);
        check(token, String);

        // Construct the API URL
        var myFuture = new Future();

        var apiUrl = 'https://ec2-52-37-126-44.us-west-2.compute.amazonaws.com:9000/cameras/' + username;

        HTTP.call("POST", apiUrl,
            { data: registerObj,
              headers: { 'Authorization': token, 'Content-Type': 'application/json' }
            },
            function (error, result) {
                if (!error) {
                    myFuture.return(result);
                } else {
                    myFuture.return(error.response);
                    //myFuture.throw(error);
                }
            });
        return myFuture.wait();
    }
});