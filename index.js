"use strict";
var config =  require( __dirname + '/config.json' ).server
  , http = require( __dirname + '/httpResponses' )
  , persistence = require( __dirname + '/persistence' )
  , crypto = require( 'crypto' )
  , fs = require( 'fs' )
  , mv = require( 'mv' )
  , qs = require( 'querystring' )
  , pf = require( 'poor-form' )
  , Career = persistence.Career
  , Subject = persistence.Subject
  , Document = persistence.Document
  , fileCounter = 0;
  ;

// Fetch all Subjects and respond
function getSubjects( response ) {
    Subject.findAll( { include: [ Career ] } ).complete( function( error, result ) {
        var subjects = result.map( function( subject ) {
            return subject.toJSON( );
        } );
        http.ok( response, JSON.stringify( subjects ) );
    } );
};

// Fetch all Exams with the indicated @subject and respond
// @subject: Subject id (int)
function getExams( args, response ) {
    if( args.subject == undefined ) {
        http.badRequest( response, '"subject" missing' );
    } else {
        args.subject = parseInt( args.subject );
        if( args.subject == NaN ) {
            http.badRequest( response, '"subject" must be a number' );
        } else {
            Document
                .findAll( {
                    where: {
                        SubjectId: args.subject,
                        type: Document.DocumentType.EXAM
                    }
                } )
                .complete( function( error, documents ) {
                    var answer;
                    if( error ) {
                        http.internalError( response, 'error finding document ' + args.id );
                        console.log( error );
                    } else {
                        answer = documents.map( function( doc ) {
                            var document = {};
                            document.id = doc.id;
                            document.year = doc.year;
                            document.turn = doc.turn;
                            document.call = doc.call;
                            document.ext = doc.ext;
                            document.mimeType = doc.mimetype;
                            return document;
                        } );
                        http.ok( response, JSON.stringify( answer ) );
                    }
                } );
        }
    }
}

// Fetch the Exam with @id and respond with the file.
// @id: Document id (int)
function getExam( args, response ) {
    if( args.id == undefined ) {
        http.badRequest( response, '"id" missing' );
    } else {
        args.id = parseInt( args.id );
        if( args.id == NaN ) {
            http.badRequest( response, '"id" must be a number' );
        } else {
            Document
                .find( { id: args.id, include: [ Subject ]} )
                .complete( function ( error, file ) {
                    var filestream
                      , filename
                      , path
                      ;
                    if( error ) {
                        http.internalError( response, 'error finding document ' + args.id );
                        console.log( error );
                    } else  if( file !== null ) {
                        path = 'uploads/' + file.file.substr( 0, 2 ) + '/' + file.file;
                        filename = [file.subject.name, file.year, file.turn, file.call].join('.') + '.' + file.ext;
                        filestream = fs.createReadStream( path );
                        response.setHeader( 'Content-Disposition', 'attachment; filename=' + filename );
                        response.writeHead( 200, file.type );
                        filestream.pipe( response );
                    } else {
                        http.badRequest( response, '"id" ' + args.id + ' does not match an exam' );
                    }
                } );
        }
    }
}

// Fetch all Notes with the indicated @subject and respond
// @subject: Subject id (int)
function getNotes( args, response ) {
    if( args.subject == undefined ) {
        http.badRequest( response, '"subject" missing' );
    } else {
        args.subject = parseInt( args.subject );
        if( args.subject == NaN ) {
            http.badRequest( response, '"subject" must be a number' );
        } else {
            Document
                .findAll( {
                    where: {
                        SubjectId: args.subject,
                        type: Document.DocumentType.NOTE
                    }
                } )
                .complete( function( error, documents ) {
                    var answer;
                    if( error ) {
                        http.internalError( response, 'error finding document ' + args.id );
                        console.log( error );
                    } else {
                        answer = documents.map( function( doc ) {
                            var document = {};
                            document.id = doc.id;
                            document.name = doc.name;
                            document.ext = doc.ext;
                            document.mimeType = doc.mimetype;
                            return document;
                        } );
                        http.ok( response, JSON.stringify( answer ) );
                    }
                } );
        }
    }
}

// Fetch the Note with @id and respond with the file.
// @id: Document id (int)
function getNote( args, response ) {
    if( args.id == undefined ) {
        http.badRequest( response, '"id" missing' );
    } else {
        args.id = parseInt( args.id );
        if( args.id == NaN ) {
            http.badRequest( response, '"id" must be a number' );
        } else {
            Document
                .find( {
                    where: {
                        id: args.id
                    } } )
                .complete( function ( error, file ) {
                    var filestream
                      , filename
                      , path
                      ;
                    if( error ) {
                        http.internalError( response, 'error finding document ' + args.id );
                        console.log( error );
                    } else  if( file !== null ) {
                        path = 'uploads/' + file.file.substr( 0, 2 ) + '/' + file.file;
                        filename = file.name + '.' + file.ext;
                        filestream = fs.createReadStream( path );
                        response.setHeader( 'Content-Disposition', 'attachment; filename=' + filename );
                        response.writeHead( 200, file.type );
                        filestream.pipe( response );
                    } else {
                        http.badRequest( response, '"id" ' + args.id + ' does not match an note' );
                    }
                } );
        }
    }
}

// Handle HTTP GET Request
function doGet( request, response ) {
    var split
       , op
       , arg
       ;
    split = request.url.split('?');
    op = split[0];
    arg = split[1];
    try {
        switch( op ) {
            case '/Materias':
                getSubjects( response );
                break;
            case '/Examenes':
                getExams( qs.parse( arg ), response );
                break;
            case '/Examen':
                getExam( qs.parse( arg ), response );
                break;
            case '/Apuntes':
                getNotes( qs.parse( arg ), response );
                break;
            case '/Apunte':
                getNote( qs.parse( arg ), response );
                break;
            default:
                http.badRequest( response, request.url );
        }
    } catch ( e ) {
        http.internalError( response, e );
        console.log( e );
    }
};

// Fetch HTTP POST Fields (multipart/form-data) from @request as an object
// and evaluate @action(object) on success, or @onError on failure
function fetchPostAndDo( request, action, onError ) {
    var tmpPath = '/tmp/cei-upload-' + fileCounter
      , form = pf.create( request )
      , key
      , value
      , object = {}
      , file
      ;

    fileCounter += 1;
    if( !form ) {
        onError( 'Not a multipart/form-data' );
    } else {
        form.on( 'fieldstart', function( headers ) {
            key = headers.name;
            if( !headers.filename ) {
                value = '';
            } else {
                file = {}
                file.data = fs.createWriteStream( tmpPath );
                file.hash = crypto.createHash('sha1');
                file.type = headers.type;
                file.name = headers.filename;
            }
        } );
        form.on( 'fielddata', function( buffer ) {
            if( file ) {
                file.data.write( buffer );
                file.hash.update( buffer );
            } else {
                value += buffer.toString( 'utf-8' );
            }
        } );
        form.on( 'fieldend', function( ) {
            if( file ) {
                file.data.end();
                object[key] = {
                    name: file.name,
                    path: tmpPath,
                    type: file.type,
                    sha1: file.hash.digest( 'hex' ),
                };
                file = undefined;
            } else {
                object[key] = value;
            }
        } );
        form.on( 'formend', function( ) {
            action( object );
        } );
     }
}

function parseExamParameters( args, failure ) {
    args.subject = parseInt( args.subject );
    args.year = parseInt( args.year );
    if( args.year == NaN ) {
        failure( '"year" should be an integer' );
    }
    switch( args.turn.toLowerCase() ) {
        case 'february':
            args.turn = Document.Turn.FEBRUARY;
            break;
        case 'july':
            args.turn = Document.Turn.JULY;
            break;
        case 'december':
            args.turn = Document.Turn.DECEMBER;
            break;
        case 'special':
            args.turn = Document.Turn.SPECIAL;
            break;
        case 'partial':
            args.turn = Document.Turn.PARTIAL;
            break;
        case 'recuperatory':
            args.turn = Document.Turn.RECUPERATORY;
            break;
        default:
            failure( '"turn" should be one of: february, july, december, special, partial or recuperatory' );
    }
    args.call = parseInt( args.call );
    if( args.call != 1 && args.call != 2 ) {
        failure( '"call" should be either 1 or 2' );
    }
}
// Fetch exam from HTTP POST and store it.
// @year: int
// @turn: string [ february, july, december, special, partial, recuperatory ] (case insensitive)
// @call: int [1, 2]
// @file: binary-data
function postExam( response ) {
    return function ( args ) {
        var filename;
        filename = 'uploads/' + args.file.sha1.substr( 0, 2 ) + '/' + args.file.sha1;
        parseExamParameters( args, function( message ) {
            http.badRequest( response, message );
        } );
        mv( args.file.path, filename, {mkdirp: true}, function(err) {
            if( !err ) {
                Subject
                    .find( { where: { id: args.subject } } )
                    .complete( function( err, subject ) {
                        var name
                          , ext
                          , split
                          ;
                        split = args.file.name.split('.');
                        ext = split.pop();
                        if( split.length == 0 ) {
                            name = args.file.name;
                        } else {
                            name = split.join('.');
                        }
                        if( !err ) {
                            Document.create( {
                                file: args.file.sha1,
                                mimetype: args.file.type,
                                name: name,
                                ext: ext,
                                type: Document.DocumentType.EXAM,
                                year: args.year,
                                turn: args.turn,
                                call: args.call
                            } ).complete( function( err, document ) {
                                if( !err ) {
                                    document.setSubject( subject );
                                    http.ok( response, JSON.stringify( { success: true } ) );
                                } else {
                                    http.internalError( response, 'error storing file' );
                                    console.log( err );
                                }
                            } );
                        } else {
                            http.badRequest( response, 'subject not found' );
                        }
                    } );
            } else {
                http.internalError( response, 'error storing file' );
                console.log( err );
            }
        });
    };
}

// Fetch note from HTTP POST and store it.
// @year: int
// @file: binary-data
function postNote( response ) {
    return function ( args ) {
        var filename;
        args.subject = parseInt( args.subject );
        filename = 'uploads/' + args.file.sha1.substr( 0, 2 ) + '/' + args.file.sha1;
        mv( args.file.path, filename, {mkdirp: true}, function(err) {
            if( !err ) {
                Subject
                    .find( { where: { id: args.subject } } )
                    .complete( function( err, subject ) {
                        var name
                          , ext
                          , split
                          ;
                        split = args.file.name.split('.');
                        ext = split.pop();
                        if( split.length == 0 ) {
                            name = args.file.name;
                        } else {
                            name = split.join('.');
                        }
                        if( !err ) {
                            Document.create( {
                                file: args.file.sha1,
                                mimetype: args.file.type,
                                name: name,
                                ext: ext,
                                type: Document.DocumentType.NOTE,
                            } ).complete( function( err, document ) {
                                if( !err ) {
                                    document.setSubject( subject );
                                    http.ok( response, JSON.stringify( { success: true } ) )
                                } else {
                                    http.internalError( response, 'error storing file' );
                                    console.log( err );
                                }
                            } );
                        } else {
                            http.badRequest( response, 'subject not found' );
                        }
                    } );
            } else {
                http.internalError( response, 'error storing file' );
                console.log( err );
            }
        });
    };
}

// Handle HTTP POST Request
function doPost( request, response ) {
    var action = function ( object ) { http.notImplemented( response ); }
      , failure = function ( errorMessage ) { http.badRequest( response, errrorMessage ); }
      ;
    switch( request.url ) {
        case '/Examen':
            fetchPostAndDo( request, postExam( response ), failure );
            break;
        case '/Apunte':
            fetchPostAndDo( request, postNote( response ), failure );
            break;
        default:
            http.badRequest( response, request.url );
    }
}

// Handle HTTP Request
function handleRequest( request, response ) {
    console.log( request.connection.remoteAddress + "\t" + request.method, request.url );
	response.setHeader( 'Access-Control-Allow-Origin', '*' );
    switch( request.method ) {
        case 'GET':
            doGet( request, response );
            break;
        case 'POST':
            doPost( request, response );
            break;
        default:
            http.notSupporting( response, request.method );
    }
}

require( 'http' ).createServer( handleRequest ).listen( config.port );
