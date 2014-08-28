"use strict";
var persistence = require(__dirname + "/persistence");
var config = require(__dirname + "/config");

delete config.database.password;
delete config.database.user;

var Career = persistence.Career;
var Subject = persistence.Subject;
var Document = persistence.Document;

persistence.sequelize
	.sync({ force:true })
	.complete( function(err) {
		if (!!err) {
			console.log("An error has occurred while creating the table:", err);
		} else {
			console.log("Darabase '" + config.database.database + "' Created");
		}
	}
);
