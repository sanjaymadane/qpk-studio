/********************************************************
* Check to which file format contacts need to be exported
* Return the specific key list
* Murtuza Kothawala, May 2016
*********************************************************/
'use strict'

module.exports = function(type){
	switch(type) {
		case 'google':
			return require('./google.js');
			break;

		case 'apple':
		default: 
			return require('./apple.js');
	}
}