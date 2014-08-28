"use strict";
var config = require( __dirname + '/config.json' ).database
  , Sequelize = new require( 'sequelize' );
  
  
  exports.sequelize = new Sequelize(
    config.database,
    config.user,
    config.password, {
        dialect: "mysql",
        port: config.port,
        host: config.host,
        logging: false,
        define: {
            charset: 'utf8',
            collate: 'utf8_bin',
            timestamps: false
        }
    } )

 // Establish a connection.
exports.sequelize
    .authenticate( )
    .complete( function(err) {
        if ( !!err ) {
            console.log('Unable to connect to the database:', err)
        }
    }
);

// Define the Career class Schema
exports.Career = exports.sequelize.define(
    'Career',
    { name: Sequelize.STRING }
);

// Define the Subject class Schema
exports.Subject = exports.sequelize.define(
    'Subject',
    { name: Sequelize.STRING }
);

// Relationship Career-Subject (1-N)
exports.Subject.belongsTo( exports.Career );
exports.Career.hasMany( exports.Subject );

// Constants to be used in Document class
var Turn = {
        FEBRUARY: 'Feb',
        JULY: 'Jul',
        DECEMBER: 'Dec',
        SPECIAL: 'SP',
        PARTIAL: 'Par',
        RECUPERATORY: 'Rec'
    }
  , DocumentType = {
        NOTE: 'NOTE',
        EXAM: 'EXAM'
    }
  ;

// Define the Document class Schema
exports.Document = exports.sequelize.define(
    'Document',
    {
        file: Sequelize.STRING(40),
        mimetype: Sequelize.STRING,
        name: Sequelize.STRING,
        ext: Sequelize.STRING(8),
        type: Sequelize.ENUM( DocumentType.NOTE, DocumentType.EXAM ),
        year: Sequelize.INTEGER,
        turn: Sequelize.ENUM( Turn.FEBRUARY, Turn.JULY, Turn.DECEMBER, Turn.SPECIAL, Turn.PARTIAL, Turn.RECUPERATORY ),
        call: Sequelize.INTEGER
    }
);

// Relationship Subject-Document (1-N)
exports.Document.belongsTo( exports.Subject );
exports.Subject.hasMany( exports.Document );

// Set the constants defined Above
exports.Document.Turn = Turn;
exports.Document.DocumentType = DocumentType;
