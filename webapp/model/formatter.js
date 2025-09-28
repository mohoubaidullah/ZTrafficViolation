sap.ui.define([], function () {
	"use strict";
	return {
		approverText: function (lvl) {

			switch (lvl) {
			case "FLT":
				return "Fleet Team 1";
			case "FL2":
				return "Fleet Team 2";
			case "HR":
				return "Human Resource";
			case "FIN":
				return "Finance";
			case "STM":
				return "Sales Team";
			case "LML":
				return "Lastmile Team";
			case "TRM":
				return "Treasury Team";
			case "SUP":
				return "Supervisor";
			default:
				return lvl;
			}
		}
	};
});