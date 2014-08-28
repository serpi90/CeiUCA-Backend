"use strict";
var name
  , id
  , persist
  , Career
  , Subject
  ;

if ( process.argv[2] === undefined || process.argv[3] === undefined) {
	console.log( ['Usage: ', process.argv[0], process.argv[1], '<career id> <subject name>'].join(' ') );
} else {
    id = parseInt( process.argv[2] );
    
    if ( id === NaN ) {
        console.log( 'id id must be a number' );
    } else {
        persist = require(__dirname + '/persistence')
        Career = persist.Career
        Subject = persist.Subject
        name = process.argv.slice(3).join(' ');
        Career.
            find( { where: {id: id} } )
            .complete( function ( error, career ) {
                if( error ) {
                    console.log( error );
                } else if ( career === null ) {
                    console.log( 'Career ' +  id + ' not found');
                } else {
                    Subject
                        .create( { name: name } )
                        .complete( function ( error, subject ) {
                            if( error ) {
                                console.log( error );
                            } else {
                                subject.setCareer( career );
                                console.log( 'Subject ' +  name + ' created successfully');
                            }
                        } );
                }
            } );
    }
}
