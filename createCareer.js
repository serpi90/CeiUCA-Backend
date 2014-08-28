"use strict";
var name;

if ( process.argv[2] === undefined ) {
	console.log( ['Usage: ', process.argv[0], process.argv[1], '<career name>'].join(' ') );
} else {
    name = process.argv.slice(2).join(' ');
	require(__dirname + '/persistence')
		.Career
		.create( { name: name } )
		.complete( function ( error, career ) {
			if( error ) {
				console.log( error );
			} else {
				console.log( 'Career ' +  name + ' created successfully with id: ' + career.id );
			}
		} );
}
