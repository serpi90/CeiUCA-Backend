"use strict";
// Answer an http @response with @number as Status Code and @message as Content
exports.respond = function ( response, number, message ) {
    response.statusCode = number;
    response.end( message );
}

// Answer an http @response with @number as Status Code and @number + @message as Content
exports.respondError = function ( response, number, message ) {
    var resp = { success: false, httpCode: number, error: message };
    exports.respond( response, number, JSON.stringify(resp) );
}

// Answer 200 Ok
exports.ok = function ( response, message ) {
    exports.respond( response, 200, message );
};

// Answer 405 Not Supporting
exports.notSupporting = function ( response, method ) {
    exports.respondError( 405, 'Not supporting: ' + method );
};

// Answer 501 Not Implemented
exports.notImplemented = function ( response ) {
    exports.respondError( response, 501, 'Not Implemented' );
};

// Answer 500 Internal Error
exports.internalError = function ( response, message ) {
    console.log( message );
    exports.respondError( response, 500, 'Internal Error' );
}

// Answer 400 Bad Request
exports.badRequest = function ( response, message ) {
    if( !message ) {
        exports.respondError( response, 400, 'Bad Request' );
    } else {
        exports.respondError( response, 400, 'Bad Request: ' +  message );
    }
}