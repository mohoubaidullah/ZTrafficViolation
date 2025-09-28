//var Workitem_id = "";
var Violation_ID = "";
var currentUser = "";
var signed_by = "";
var ApprovalLvl = "";
var violationTypeAr = "";
var violationTypeEn = "";
sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/BindingMode",
		"sap/ui/core/message/Message",
		"sap/ui/core/MessageType",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/core/library",
		"sap/ui/core/Fragment",
		'sap/ui/model/Filter',
		"../model/formatter"
	],

	function (Controller, JSONModel, BindingMode, Message, MessageType, MessageToast, MessageBox, library, Fragment, Filter, formatter) {
		"use strict";

		return Controller.extend("Fleet.ZTrafficViolation.controller.View1", {
			formatter: formatter,
			onInit: function () {
				var oMessageManager, oView;
				if (window.sap.ushell && window.sap.ushell.Container) {
					currentUser = window.sap.ushell.Container.getUser().getId();
				}
				oView = this.getView();
				oMessageManager = sap.ui.getCore().getMessageManager();
				oView.setModel(oMessageManager.getMessageModel(), "message");
				var string = "";
				var complete_url = window.location.href;
				//var pieces = complete_url.split("?");
				var pieces = complete_url.split("ccc");
				if (pieces.length === 2) {
					string = pieces[1];
					Violation_ID = string.substr(1, 10);
				}

				var onView = {
					ViolationID: false,
					ViolationDescEn: false,
					EmployeeID: false,
					PayFrom: false,
					ViewComments: true,
					EditButton: true,
					SaveButton: false,
					DigitalSignButton: false,
					Comment1: false,
					Comment2: false,
					Comment3: false,
					Comment4: false,
					Comment5: false,
					Fleet2Upload: false,
					MandatoryUpload: false,
					MandatoryComment1: false
				};

				this.oLocalModel = new sap.ui.model.json.JSONModel(onView);
				this.oLocalModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
				oView.setModel(this.oLocalModel, "localModel");

				var oModel = this.getView().getModel();

				var sPath = "/ViolationDetailsSet('" + Violation_ID + "')";
				var that = this;
				oModel.read(sPath, {
					// urlParameters: {
					// 	"$filter": filter_string
					// },
					success: function (oData1, response) {
						oData1.ViolationDate = oData1.ViolationDate ? oData1.ViolationDate.toDateString() : null;
						oData1.UploadDate = oData1.UploadDate ? oData1.UploadDate.toDateString() : null;
						oData1.ViolationTime = oData1.ViolationTime ? new Date(oData1.ViolationTime.ms).toISOString().slice(11, -5) : null;
						oData1.UploadedTime = oData1.UploadedTime ? new Date(oData1.UploadedTime.ms).toISOString().slice(11, -5) : null;
						ApprovalLvl = oData1.CurrentApproval;
						if (oData1.UploadedSource === "T") {
							oData1.UploadedFromText = "TAMM Uploaded";
						} else if (oData1.UploadedSource === "M") {
							oData1.UploadedFromText = "MOT Uploaded";
						} else if (oData1.UploadedSource === "U") {
							oData1.UploadedFromText = "Maqeem Uploaded";
						}
						violationTypeEn = oData1.ViolationDescEn;
						var resourceBundle = that.getView().getModel("i18n").getResourceBundle();
						oData1.MessageBinding = resourceBundle.getText(oData1.CurrentApproval ? oData1.CurrentApproval : "OTHR");
						var oModel3 = new sap.ui.model.json.JSONModel(oData1);
						//oData1.SalesOfficeText  =
						that.getSalesOfficeText(oData1.Vkbur);
						var osf = that.getView().byId("IdViolationDetails");
						osf.setModel(oModel3);

						that.getComments(oData1.ViolationId);
						that.getHistory(oData1.ViolationId);

					},
					error: function () {
						that.getView().getModel("localModel").setProperty("/SubmitRequestVisible", false);
						sap.m.MessageToast.show("No Data retreived");
					}
				});
			},
			getSalesOfficeText: function (SalesOffice) {
				var oModel = this.getView().getModel();
				var sPath = "/GetSalesOfficeSet('" + SalesOffice + "')";
				var that = this;
				oModel.read(sPath, {
					success: function (oData, response) {
						that.getView().getModel("localModel").setProperty("/SalesOfficeText", oData.SalesOfficeText);
					},
					error: function () {
						sap.m.MessageToast.show("Sales Office Not available");
					}
				});
			},
			formatterStatus: function (status) {
				switch (status) {
				case "P":
					return "Pending";
				case "A":
					return "Approved";
				case "R":
					return "Rejected";
				case "E":
					return "Error";
				case "N":
					return "Not Applicable";
				default:
					return status;
				}
			},
			// formatterLevel: function (lvl) {
			// 	switch (lvl) {
			// 	case "FLT":
			// 		return "Fleet Team 1";
			// 	case "FL2":
			// 		return "Fleet Team 2";
			// 	case "HR":
			// 		return "Human Resource";
			// 	case "FIN":
			// 		return "Finance";
			// 	case "STM":
			// 		return "Sales Team";
			// 	case "LML":
			// 		return "Lastmile Team";
			// 	case "TRM":
			// 		return "Treasury Team";
			// 	}
			// },
			getHistory: function (ViolationId) {
				var oModel = this.getView().getModel();
				var sPath = "/ApprovalHistorySet?$filter=ViolationId eq '" + ViolationId + "'";
				var that = this;
				oModel.read(sPath, {
					success: function (OData, response) {

						var oView;
						oView = that.getView();
						that.oLocalModel = new sap.ui.model.json.JSONModel(OData);
						that.oLocalModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
						oView.setModel(that.oLocalModel, "historyModel");
					},
					error: function () {
						sap.m.MessageToast.show("No Data retreived For Approval History");
					}
				});
			},
			getComments: function (ViolationId) {
				var oModel = this.getView().getModel();
				var sPath = "/CommentsSet('" + ViolationId + "')";
				var that = this;
				oModel.read(sPath, {
					// urlParameters: {
					// 	"$filter": filter_string
					// },
					success: function (oData1, response) {

						// var oModel2 = new sap.ui.model.json.JSONModel(oData1);
						// var osf2 = that.byId("IdCommentsDetails");
						// osf2.setModel(oModel2);

						var comments = oData1;
						var sPath2 = "/Comments2Set('" + ViolationId + "')";
						if (ApprovalLvl === "SUP") {
							oModel.read(sPath2, {
								success: function (oData2, response2) {
									oData1.Comment1 = oData1.Sup1 = oData2.Sup1;
									oData1.Comment2 = oData1.Sup2 = oData2.Sup2;
									oData1.Comment3 = oData1.Sup3 = oData2.Sup3;
									oData1.Comment4 = oData1.Sup4 = oData2.Sup4;
								},
								error: function () {
									sap.m.MessageToast.show("No Data retreived for Supervisor Comments");
								}
							});
						}
						if (ApprovalLvl === "FLT") {
							oData1.Comment1 = oData1.Fleet1;
							oData1.Comment2 = oData1.Fleet2;
							oData1.Comment3 = oData1.Fleet3;
							oData1.Comment4 = oData1.Fleet4;
						} else if (ApprovalLvl === "FIN") {
							oData1.Comment1 = oData1.Fin1;
							oData1.Comment2 = oData1.Fin2;
							oData1.Comment3 = oData1.Fin3;
							oData1.Comment4 = oData1.Fin4;
						} else if (ApprovalLvl === "HR") {
							oData1.Comment1 = oData1.Hr1;
							oData1.Comment2 = oData1.Hr2;
							oData1.Comment3 = oData1.Hr3;
							oData1.Comment4 = oData1.Hr4;
						} else if (ApprovalLvl === "LML") {
							oData1.Comment1 = oData1.Delv1;
							oData1.Comment2 = oData1.Delv2;
							oData1.Comment3 = oData1.Delv3;
							oData1.Comment4 = oData1.Delv4;
						} else if (ApprovalLvl === "STM") {
							oData1.Comment1 = oData1.Sales1;
							oData1.Comment2 = oData1.Sales2;
							oData1.Comment3 = oData1.Sales3;
							oData1.Comment4 = oData1.Sales4;
						} else if (ApprovalLvl === "FL2") {
							oData1.Comment1 = oData1.Fleet6;
							oData1.Comment2 = oData1.Fleet7;
							oData1.Comment3 = oData1.Fleet8;
							oData1.Comment4 = oData1.Fleet9;
						} else if (ApprovalLvl === "TRM") {
							oData1.Comment1 = oData1.TRM1;
							oData1.Comment2 = oData1.TRM2;
							oData1.Comment3 = oData1.TRM3;
							oData1.Comment4 = oData1.TRM4;
						}
						var oView;

						oView = that.getView();
						that.oLocalModel = new sap.ui.model.json.JSONModel(comments);
						that.oLocalModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
						oView.setModel(that.oLocalModel, "commentsModel");
						var oModel3 = new sap.ui.model.json.JSONModel(oData1);
						var osf = that.getView().byId("idComments");
						osf.setModel(oModel3);
					},
					error: function () {
						sap.m.MessageToast.show("No Data retreived for Comments");
					}
				});
			},
			onChangeLocal: function (oEvent) {
				violationTypeAr = oEvent.getSource().getSelectedKey();
				violationTypeEn = oEvent.getSource().getValue();
				this.getView().byId('idViolationDescEn').setValueState(sap.ui.core.ValueState.none);
				var results = this.getView().getModel('ViolMaster').getData().results.filter(function f(a) {
					if (a.ViolEn === oEvent.getSource().getSelectedKey()) {
						return a;
					} else {
						return null;
					}
				});
				if (results && results.length > 0) {
					if (results[0].PayFrom === "D") {
						this.getView().byId("idPayFrom").setSelectedKey("Driver");
						this.getView().byId('idPayFrom').setValueState(sap.ui.core.ValueState.None);
					} else if (results[0].PayFrom === "B") {
						this.getView().byId("idPayFrom").setSelectedKey("Berain");
						this.getView().byId('idPayFrom').setValueState(sap.ui.core.ValueState.None);
					} else if (results[0].PayFrom === "L") {
						this.getView().byId("idPayFrom").setSelectedKey("Transport");
						this.getView().byId('idPayFrom').setValueState(sap.ui.core.ValueState.None);
					} else {
						this.getView().byId('idPayFrom').setValueState(sap.ui.core.ValueState.Error);
						this.getView().byId("idPayFrom").setSelectedKey("");
					}
				}
			},
			onEnterEmpID: function (oEvent) {
				var oModel = this.getView().getModel();
				var empID = this.getView().byId("idEmpId").getValue();
				var sPath = "/EmployeeDetailsSet('" + empID + "')";
				var that = this;
				oModel.read(sPath, {
					success: function (oData1, response) {
						//var oModel3 = new sap.ui.model.json.JSONModel(oData1);
						//var osf = that.getView().byId("IdViolationDetails");
						//osf.setModel(oModel3);
						if (oData1 && oData1.Pernr) {
							that.getView().byId("idNameEn").setText(oData1.Ename);
							that.getView().byId("idZidentity").setText(oData1.Zidentity);
							this.getView().byId('idEmpId').setValueState(sap.ui.core.ValueState.None);
						}

					},
					error: function () {
						sap.m.MessageToast.show("No Data retreived");
						this.getView().byId('idEmpId').setValueState(sap.ui.core.ValueState.Error);

					}
				});
			},
			onSignRequest: function (oEvent) {
				signed_by = 'X';
				var Violation = {};
				var oModel = this.getView().getModel();
				//var that = this;
				var violationId = this.getView().byId("idViolationId").getText();
				var violationDescEn = this.getView().byId("idViolationDescEn").getValue();
				var empId = this.getView().byId("idEmpId").getValue();
				var empName = this.getView().byId("idNameEn").getText();
				var identity = this.getView().byId("idZidentity").getText();
				var payFrom = this.getView().byId("idPayFrom").getSelectedKey();
				// Comments from Current Processor

				if (violationTypeEn !== "") {
					Violation.ViolationDescEn = violationTypeEn;
					// Violation.ViolationDesc = violationTypeAr;
				} else {
					Violation.ViolationDescEn = violationDescEn;
				}
				Violation.PayFrom = payFrom;
				Violation.Pernr = empId;
				Violation.Ename = empName;
				Violation.ViolationId = violationId;
				Violation.Aenam = currentUser;
				Violation.Zidentity = identity;
				Violation.ViolationId = violationId;
				Violation.DigitalSign = signed_by;
				oModel.create("/ViolationDetailsSet",
					Violation, {
						success: function (oData, response) {
							sap.m.MessageToast.show("You have Signed the form Digitally,Save the application");
						},
						error: function (oError) {
							var errorMsg = jQuery.parseJSON(oError.responseText).error.message.value;
							sap.m.MessageBox.error(errorMsg, {});
							return;
						}
					});
				signed_by = "";
				this.getView().getModel("localModel").setProperty("/DigitalSignButton", false);

			},
			onViewComment: function (oEvent) {
				var oView = this.getView();
				var oDialog = oView.byId("idCommentsView");
				// create dialog lazily
				if (!oDialog) {
					// create dialog via fragment factory
					// var oModel2 = new sap.ui.model.json.JSONModel(oData1);
					// var osf2 = that.byId("IdCommentsDetails");
					// osf2.setModel(oModel2);
					oDialog = sap.ui.xmlfragment(oView.getId(), "Fleet.ZTrafficViolation.view.Comments", this);
					// connect dialog to view (models, lifecycle)
					oView.addDependent(oDialog);
				}
				oDialog.open();

			},
			onViewHistory: function (oEvent) {
				var oView = this.getView();
				var oDialog = oView.byId("idHistoryView");
				// create dialog lazily
				if (!oDialog) {
					// create dialog via fragment factory
					// var oModel2 = new sap.ui.model.json.JSONModel(oData1);
					// var osf2 = that.byId("IdCommentsDetails");
					// osf2.setModel(oModel2);
					oDialog = sap.ui.xmlfragment(oView.getId(), "Fleet.ZTrafficViolation.view.History", this);
					// connect dialog to view (models, lifecycle)
					oView.addDependent(oDialog);
				}
				oDialog.open();
			},
			onCloseHistory: function (oEvent) {
				// note: We don't need to chain to the pDialog promise, since this event-handler
				// is only called from within the loaded dialog itself.
				this.byId("idHistoryView").close();
			},
			onCloseDialog: function (oEvent) {
				// note: We don't need to chain to the pDialog promise, since this event-handler
				// is only called from within the loaded dialog itself.
				this.byId("idCommentsView").close();
			},
			postFileToBackend: function (ViolationID, filename, filetype, content) {
				var payload = {
					"Filename": filename,
					"Value": content,
					"Mimetype": filetype,
					"ViolationId": ViolationID,
					"Counter": "001",
					"Level": ApprovalLvl
				};

				var oModel = this.getView().getModel();
				oModel.create("/FileUploadSet",
					payload, {
						success: function (oData, response) {

						},
						error: function (oError) {

						}
					});
			},
			updateComments: function (Comments) {
				var oModel = this.getView().getModel();
				if (ApprovalLvl === 'SUP') {
					oModel.create("/Comments2Set",
						Comments, {
							success: function (oData, response) {

							},
							error: function (oError) {

							}
						});
				} else {
					oModel.create("/CommentsSet",
						Comments, {
							success: function (oData, response) {

							},
							error: function (oError) {

							}
						});
				}
			},
			onEdit: function (oEvent) {
				this.getView().getModel("localModel").setProperty("/Fleet2Upload", true);
				if (ApprovalLvl === 'FLT') {
					this.getView().getModel("localModel").setProperty("/ViolationDescEn", true);
					this.getView().getModel("localModel").setProperty("/EmployeeID", true);
					this.getView().getModel("localModel").setProperty("/PayFrom", true);
					this.getView().getModel("localModel").setProperty("/MandatoryUpload", false);

					var oModel = this.getView().getModel();

					//var that = this;
					oModel.read("/ViolationMasterSet", {
						success: function (oData, response) {
							var oViolationMaster = new JSONModel();
							oViolationMaster.setData(oData);
							this.getView().setModel(oViolationMaster, "ViolMaster");
						}.bind(this),
						error: function () {
							sap.m.MessageToast.show("No Data retreived");
						}
					});
				} else if (ApprovalLvl === 'FL2') {
					this.getView().getModel("localModel").setProperty("/Fleet2Upload", true);
					this.getView().getModel("localModel").setProperty("/MandatoryUpload", true);
				} else if (ApprovalLvl === 'TRM') {
					this.getView().getModel("localModel").setProperty("/MandatoryComment1", true);
				} else if (ApprovalLvl === 'SUP') {
					this.getView().getModel("localModel").setProperty("/MandatoryUpload", true);
				}

				this.getView().getModel("localModel").setProperty("/Comment1", true);
				this.getView().getModel("localModel").setProperty("/Comment2", true);
				this.getView().getModel("localModel").setProperty("/Comment3", true);
				this.getView().getModel("localModel").setProperty("/Comment4", true);
				this.getView().getModel("localModel").setProperty("/Comment5", true);

				this.getView().getModel("localModel").setProperty("/SaveButton", true);
				this.getView().getModel("localModel").setProperty("/DigitalSignButton", false);
				this.getView().getModel("localModel").setProperty("/EditButton", false);
			},
			handleLoadItems: function (oControlEvent) {
				oControlEvent.getSource().getBinding("items").resume();
			},
			handleValueHelp: function (oEvent) {
				var sInputValue = oEvent.getSource().getValue();

				this.inputId = oEvent.getSource().getId();
				// create value help dialog
				if (!this._valueHelpDialog) {
					this._valueHelpDialog = sap.ui.xmlfragment(
						"Fleet.ZTrafficViolation.view.Dialog",
						this
					);
					this.getView().addDependent(this._valueHelpDialog);
				}

				// create a filter for the binding
				this._valueHelpDialog.getBinding("items").filter([new Filter(
					"Pernr",
					sap.ui.model.FilterOperator.EQ, sInputValue
				)]);

				// open value help dialog filtered by the input value
				this._valueHelpDialog.open(sInputValue);
			},
			_handleValueHelpSearch: function (evt) {
				var sValue = evt.getParameter("value");
				var oFilter = new Filter(
					"Pernr",
					sap.ui.model.FilterOperator.EQ, sValue
				);
				evt.getSource().getBinding("items").filter([oFilter]);
			},

			_handleValueHelpClose: function (evt) {
				this.name = "";
				var that = this;
				var oSelectedItem = evt.getParameter("selectedItem");
				if (oSelectedItem) {
					var productInput = this.byId(this.inputId);
					productInput.setValue(oSelectedItem.getTitle());
					that.name = oSelectedItem.getDescription();
					that.onEnterEmpID();
				}
				evt.getSource().getBinding("items").filter([]);
			},
			onSaveRequest: function (oEvent) {
				// read from Fleet and Others

				/* Remove the below code*/
				signed_by = "";

				var violationId = this.getView().byId("idViolationId").getText();
				var violationDescEn = this.getView().byId("idViolationDescEn").getValue();
				var empId = this.getView().byId("idEmpId").getValue();
				var empName = this.getView().byId("idNameEn").getText();
				var identity = this.getView().byId("idZidentity").getText();
				var payFrom = this.getView().byId("idPayFrom").getSelectedKey();
				// Comments from Current Processor
				var Violation = {};
				if (violationDescEn === "" || violationTypeEn !== violationDescEn) {
					this.getView().byId('idViolationDescEn').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please Enter Violation Desc(En) Correctly");
					return;
					//Violation.ViolationDesc = violationTypeAr;
				} else {
					Violation.ViolationDescEn = violationDescEn;
				}

				if (empId === "" || empId === " " || empId.length < 6) {
					//"Error"
					this.getView().byId('idEmpId').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please Enter Employee ID Correctly");
					return;
				}
				if (payFrom === "") {
					this.getView().byId('idPayFrom').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please Select Pay From Correctly");
					return;
				}
				if (Violation.ViolationDescEn === "") {
					this.getView().byId('idViolationDescEn').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please Select Violation Correctly");
					return;
				}

				var oFileUploader1 = " ";
				oFileUploader1 = this.getView().byId("fileUploader1");

				var domRef1 = oFileUploader1.getFocusDomRef();
				if (domRef1.files.length === 0 && (ApprovalLvl === 'FL2' || ApprovalLvl === 'SUP')) {
					this.getView().byId('fileUploader1').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please Upload Mandtory File");
					return;
				}

				this.getView().byId('idPayFrom').setValueState(sap.ui.core.ValueState.None);
				this.getView().byId('idViolationDescEn').setValueState(sap.ui.core.ValueState.None);
				this.getView().byId('idEmpId').setValueState(sap.ui.core.ValueState.None);
				this.getView().byId('fileUploader1').setValueState(sap.ui.core.ValueState.None);
				Violation.PayFrom = payFrom;
				Violation.Pernr = empId;
				Violation.Ename = empName;
				Violation.ViolationId = violationId;
				Violation.Aenam = currentUser;
				Violation.Zidentity = identity;

				var comment1 = this.getView().byId("idComment1").getValue();
				var comment2 = this.getView().byId("idComment2").getValue();
				var comment3 = this.getView().byId("idComment3").getValue();
				var comment4 = this.getView().byId("idComment4").getValue();
				var oModel = this.getView().getModel();
				var that = this;
				if (ApprovalLvl === "TRM" && (comment1 === "" || comment1 === " ")) {
					this.getView().byId('idComment1').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please Enter Comment 1 for references, Its Mandatory");
					return;
				}
				// var flag = this.getView().byId("idITCheck1").getSelected();

				// var idOfMyButton = oEvent.getSource().getId();

				//var submit =   idOfMyButton.search('submit');
				//var sign =   idOfMyButton.search('sign');

				var Comments = {};

				Comments.ViolationId = violationId;
				if (ApprovalLvl === "FLT") {

					Comments.Fleet1 = comment1;
					Comments.Fleet2 = comment2;
					Comments.Fleet3 = comment3;
					Comments.Fleet4 = comment4;
				} else if (ApprovalLvl === "FIN") {

					Comments.Fin1 = comment1;
					Comments.Fin2 = comment2;
					Comments.Fin3 = comment3;
					Comments.Fin4 = comment4;
				} else if (ApprovalLvl === "HR") {

					Comments.Hr1 = comment1;
					Comments.Hr2 = comment2;
					Comments.Hr3 = comment3;
					Comments.Hr4 = comment4;
				} else if (ApprovalLvl === "FT2") {

					Comments.Fleet6 = comment1;
					Comments.Fleet7 = comment2;
					Comments.Fleet8 = comment3;
					Comments.Fleet9 = comment4;
				} else if (ApprovalLvl === "LML") {

					Comments.Delv1 = comment1;
					Comments.Delv2 = comment2;
					Comments.Delv3 = comment3;
					Comments.Delv4 = comment4;
				} else if (ApprovalLvl === "STM") {
					Comments.Sales1 = comment1;
					Comments.Sales2 = comment2;
					Comments.Sales3 = comment3;
					Comments.Sales4 = comment4;
				} else if (ApprovalLvl === "TRM") {
					Comments.TRM1 = comment1;
					Comments.TRM2 = comment2;
					Comments.TRM3 = comment3;
					Comments.TRM4 = comment4;
				} else if (ApprovalLvl === "SUP") {
					Comments.Sup1 = comment1;
					Comments.Sup2 = comment2;
					Comments.Sup3 = comment3;
					Comments.Sup4 = comment4;
				}

				that = this;
				var that1 = this;
				var that2 = this;
				oModel.create("/ViolationDetailsSet",
					Violation, {
						success: function (oData6, response) {

							//this.getView().getModel("localModel").setProperty("/DigitalSignButton", true);
							sap.m.MessageToast.show("Request Has Been Saved");
							// UPdate UI
							that.getView().getModel("localModel").setProperty("/SaveButton", false);
							that.getView().getModel("localModel").setProperty("/DigitalSignButton", true);
							that.getView().getModel("localModel").setProperty("/EditButton", true);

							that.getView().getModel("localModel").setProperty("/ViolationDescEn", false);
							that.getView().getModel("localModel").setProperty("/EmployeeID", false);
							that.getView().getModel("localModel").setProperty("/PayFrom", false);

							that.getView().getModel("localModel").setProperty("/Fleet2Upload", false);

							that.getView().getModel("localModel").setProperty("/Comment1", false);
							that.getView().getModel("localModel").setProperty("/Comment2", false);
							that.getView().getModel("localModel").setProperty("/Comment3", false);
							that.getView().getModel("localModel").setProperty("/Comment4", false);
							that.getView().getModel("localModel").setProperty("/Comment5", false);
							// Update Comments

							that.updateComments(Comments);
							// Upload Documents

							var oFileUploader2 = " ";

							oFileUploader2 = that.getView().byId("fileUploader2");
							var domRef2 = oFileUploader2.getFocusDomRef();
							var file1 = "";
							var file2 = "";
							var reader1 = "";
							var reader2 = "";
							if (domRef1.files.length !== 0) {
								file1 = domRef1.files[0];

								that1.filenameLicense = file1.name;
								that1.filetypeLicense = file1.type;
								that1.getView().byId("fileUploader1").setValueState(sap.ui.core.ValueState.None);
								reader1 = new FileReader();

								reader1.onload = function (e) {
									var vContent = e.currentTarget.result.replace("data:" + file1.type + ";base64,", "");
									that.postFileToBackend(violationId, that1.filenameLicense, that1.filetypeLicense, vContent);
								};

								reader1.readAsDataURL(file1);
							}
							if (domRef2.files.length !== 0) {
								file2 = domRef2.files[0];

								that2.filenameLicense2 = file2.name;
								that2.filetypeLicense2 = file2.type;
								that2.getView().byId("fileUploader2").setValueState(sap.ui.core.ValueState.None);
								reader2 = new FileReader();

								reader2.onload = function (e) {
									var vContent2 = e.currentTarget.result.replace("data:" + file2.type + ";base64,", "");
									that.postFileToBackend(violationId, that2.filenameLicense2, that2.filetypeLicense2, vContent2);
								};

								reader2.readAsDataURL(file2);
							}

						},
						error: function (oError) {
							var errorMsg = jQuery.parseJSON(oError.responseText).error.message.value;
							sap.m.MessageBox.error(errorMsg, {});
							return;
						}

					});
			}

		});

	});