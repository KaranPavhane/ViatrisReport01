sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/table/Table",
    "sap/ui/table/Column"
], function (Controller, JSONModel, MessageToast, Table, Column) {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit: function () {
            var oData = {
                ProductCollection: [
                    { Name: "C001" },
                    { Name: "C002" },
                    { Name: "C003" },
                    { Name: "C004" },
                    { Name: "C005" }
                ],
                summary: [
                    { BatchNo: "B001", Component: "C001", Release: "01/09/2025", Packing: "02/09/2025", Upload: "03/09/2025", Site: "SITE-A", Comment: "OK", CreatedBy: "Admin", ModifiedDate: "04/09/2025", ModifiedBy: "User1" },
                    { BatchNo: "B002", Component: "C002", Release: "05/09/2025", Packing: "06/09/2025", Upload: "07/09/2025", Site: "SITE-B", Comment: "Done", CreatedBy: "User2", ModifiedDate: "08/09/2025", ModifiedBy: "User3" },
                    { BatchNo: "B003", Component: "C003", Release: "09/09/2025", Packing: "10/09/2025", Upload: "11/09/2025", Site: "SITE-C", Comment: "Pending", CreatedBy: "User3", ModifiedDate: "12/09/2025", ModifiedBy: "Admin" },
                    { BatchNo: "B004", Component: "C004", Release: "12/09/2025", Packing: "13/09/2025", Upload: "14/09/2025", Site: "SITE-D", Comment: "Approved", CreatedBy: "User4", ModifiedDate: "15/09/2025", ModifiedBy: "User2" },
                    { BatchNo: "B005", Component: "C005", Release: "16/09/2025", Packing: "17/09/2025", Upload: "18/09/2025", Site: "SITE-E", Comment: "Rejected", CreatedBy: "Admin", ModifiedDate: "19/09/2025", ModifiedBy: "User5" },
                    { BatchNo: "B006", Component: "C006", Release: "20/09/2025", Packing: "21/09/2025", Upload: "22/09/2025", Site: "SITE-F", Comment: "OK", CreatedBy: "User6", ModifiedDate: "23/09/2025", ModifiedBy: "User1" },
                    { BatchNo: "B007", Component: "C007", Release: "21/09/2025", Packing: "22/09/2025", Upload: "23/09/2025", Site: "SITE-G", Comment: "Done", CreatedBy: "User7", ModifiedDate: "24/09/2025", ModifiedBy: "User2" },
                    { BatchNo: "B008", Component: "C008", Release: "22/09/2025", Packing: "23/09/2025", Upload: "24/09/2025", Site: "SITE-H", Comment: "Pending", CreatedBy: "User8", ModifiedDate: "25/09/2025", ModifiedBy: "User3" },
                    { BatchNo: "B009", Component: "C009", Release: "23/09/2025", Packing: "24/09/2025", Upload: "25/09/2025", Site: "SITE-I", Comment: "Approved", CreatedBy: "User9", ModifiedDate: "26/09/2025", ModifiedBy: "User4" },
                    { BatchNo: "B010", Component: "C010", Release: "24/09/2025", Packing: "25/09/2025", Upload: "26/09/2025", Site: "SITE-J", Comment: "Rejected", CreatedBy: "Admin", ModifiedDate: "27/09/2025", ModifiedBy: "User5" },
                    { BatchNo: "B011", Component: "C011", Release: "25/09/2025", Packing: "26/09/2025", Upload: "27/09/2025", Site: "SITE-K", Comment: "OK", CreatedBy: "User1", ModifiedDate: "28/09/2025", ModifiedBy: "User6" },
                    { BatchNo: "B012", Component: "C012", Release: "26/09/2025", Packing: "27/09/2025", Upload: "28/09/2025", Site: "SITE-L", Comment: "Done", CreatedBy: "User2", ModifiedDate: "29/09/2025", ModifiedBy: "User7" },
                    { BatchNo: "B013", Component: "C013", Release: "27/09/2025", Packing: "28/09/2025", Upload: "29/09/2025", Site: "SITE-M", Comment: "Pending", CreatedBy: "User3", ModifiedDate: "30/09/2025", ModifiedBy: "User8" },
                    { BatchNo: "B014", Component: "C014", Release: "28/09/2025", Packing: "29/09/2025", Upload: "30/09/2025", Site: "SITE-N", Comment: "Approved", CreatedBy: "User4", ModifiedDate: "01/10/2025", ModifiedBy: "User9" },
                    { BatchNo: "B015", Component: "C015", Release: "29/09/2025", Packing: "30/09/2025", Upload: "01/10/2025", Site: "SITE-O", Comment: "Rejected", CreatedBy: "Admin", ModifiedDate: "02/10/2025", ModifiedBy: "User10" }
                ],

                track: [
                    { Component: "C001", BatchFirst: "B001", DateFirst: "01/09/2025", BatchRelease: "BR01", DateRelease: "05/09/2025", BatchLast: "B002", DateLast: "10/09/2025", BatchReleaseLast: "BR02", DateReleaseLast: "12/09/2025" },
                    { Component: "C002", BatchFirst: "B003", DateFirst: "03/09/2025", BatchRelease: "BR03", DateRelease: "07/09/2025", BatchLast: "B004", DateLast: "11/09/2025", BatchReleaseLast: "BR04", DateReleaseLast: "14/09/2025" },
                    { Component: "C003", BatchFirst: "B005", DateFirst: "05/09/2025", BatchRelease: "BR05", DateRelease: "09/09/2025", BatchLast: "B006", DateLast: "13/09/2025", BatchReleaseLast: "BR06", DateReleaseLast: "16/09/2025" },
                    { Component: "C004", BatchFirst: "B007", DateFirst: "07/09/2025", BatchRelease: "BR07", DateRelease: "10/09/2025", BatchLast: "B008", DateLast: "15/09/2025", BatchReleaseLast: "BR08", DateReleaseLast: "18/09/2025" }
                ],

                audit: [
                    { User: "Admin", Action: "Login", Date: "15/09/2025", Site: "SITE-A" },
                    { User: "User1", Action: "Approve", Date: "16/09/2025", Site: "SITE-B" },
                    { User: "User2", Action: "Reject", Date: "17/09/2025", Site: "SITE-C" },
                    { User: "User3", Action: "Modify", Date: "18/09/2025", Site: "SITE-D" },
                    { User: "User4", Action: "Delete", Date: "19/09/2025", Site: "SITE-E" }
                ],

                activity: [
                    { Site: "SITE-A", Detail: "Packaging Started", CreatedBy: "User1", CreatedDate: "12/09/2025" },
                    { Site: "SITE-B", Detail: "Batch Released", CreatedBy: "User2", CreatedDate: "13/09/2025" },
                    { Site: "SITE-C", Detail: "Quality Check Done", CreatedBy: "User3", CreatedDate: "14/09/2025" },
                    { Site: "SITE-D", Detail: "Sent to Market", CreatedBy: "User4", CreatedDate: "15/09/2025" },
                    { Site: "SITE-E", Detail: "Batch Closed", CreatedBy: "Admin", CreatedDate: "16/09/2025" }
                ]

            };

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel);

            this._currentKey = null;
            this._oSelectedCard = null;

            // 🔹 Page load pe sirf input/filter bar dikhna chahiye
            this.byId("filterBar").setVisible(true);
            this.byId("cardsRow").setVisible(false);
            this.byId("tableContainer").setVisible(false);
            this.byId("downloadRow").setVisible(false);



        },

        onProductInputClick: function (oEvent) {
            var oMultiInput = this.byId("productInput");

            // ensure suggestion items already bound
            var aItems = oMultiInput.getSuggestionItems();

            if (aItems.length > 0) {
                oMultiInput.setShowSuggestion(true);   // enable
                oMultiInput.openSuggestions();         // force open
            }
        },

        onFilterGo: function () {
            // 🟢 DatePicker se directly Date object lo
            var oFrom = this.byId("fromDate").getDateValue();
            var oTo = this.byId("toDate").getDateValue();

            if (!oFrom || !oTo) {
                MessageToast.show("Please select both From and To dates");
                return;
            }

            // Include full end date
            oTo.setHours(23, 59, 59, 999);

            var oModel = this.getView().getModel();
            var oData = oModel.getData();
            var that = this;

            this._filteredData = {};

            // 🔹 Summary Data Filter
            this._filteredData.summary = (oData.summary || []).filter(function (oItem) {
                var dValue = that._parseDate(oItem.Release) || that._parseDate(oItem.Packing);
                return dValue && dValue >= oFrom && dValue <= oTo;
            });

            // 🔹 Track Data Filter
            this._filteredData.track = (oData.track || []).filter(function (oItem) {
                var dValue =
                    that._parseDate(oItem.DateFirst) ||
                    that._parseDate(oItem.DateRelease) ||
                    that._parseDate(oItem.DateLast) ||
                    that._parseDate(oItem.DateReleaseLast);
                return dValue && dValue >= oFrom && dValue <= oTo;
            });

            // 🔹 Audit Data Filter
            this._filteredData.audit = (oData.audit || []).filter(function (oItem) {
                var dValue = that._parseDate(oItem.Date);
                return dValue && dValue >= oFrom && dValue <= oTo;
            });

            // 🔹 Activity Data Filter
            this._filteredData.activity = (oData.activity || []).filter(function (oItem) {
                var dValue = that._parseDate(oItem.CreatedDate);
                return dValue && dValue >= oFrom && dValue <= oTo;
            });

            // 🔹 Default tab = summary
            this._currentKey = "summary";

            this.byId("cardsRow").setVisible(true);
            this.byId("tableContainer").setVisible(true);
            this.byId("downloadRow").setVisible(true);

            // --- Default table show karo ---
            this._createTable("summary", this._filteredData.summary);

            // --- Default card highlight karo ---
            var oDefaultCard = this.byId("summaryCardId"); // XML me id hona chahiye
            if (oDefaultCard) {
                if (this._oSelectedCard) {
                    this._oSelectedCard.removeStyleClass("selectedCard");
                }
                this._oSelectedCard = oDefaultCard;
                oDefaultCard.addStyleClass("selectedCard");
            }

            // --- Sab filter bars pehle hide karo ---
            this.byId("summaryFilterBar").setVisible(false);
            this.byId("trackFilterBar").setVisible(false);
            this.byId("auditFilterBar").setVisible(false);
            this.byId("activityFilterBar").setVisible(false);

            // --- Sirf summary ke filters dikhao ---
            this.byId("summaryFilterBar").setVisible(true);
        },


        _parseDate: function (sDate) {
            if (!sDate) return null;
            var parts = sDate.split("/"); // dd/mm/yyyy
            if (parts.length !== 3) return null;
            return new Date(parts[2], parts[1] - 1, parts[0]);
        },

        onFilterReset: function () {
            // 🔹 Product MultiInput reset
            this.byId("productInput").removeAllTokens();

            // 🔹 From/To date reset (ab input hain, DatePicker nahi)
            this.byId("fromDate").setValue("");
            this.byId("toDate").setValue("");

            // 🔹 Hide containers
            this.byId("cardsRow").setVisible(false);
            this.byId("tableContainer").setVisible(false);
            this.byId("downloadRow").setVisible(false);

            // 🔹 Hide all filter bars
            this.byId("summaryFilterBar").setVisible(false);
            this.byId("trackFilterBar").setVisible(false);
            this.byId("auditFilterBar").setVisible(false);
            this.byId("activityFilterBar").setVisible(false);

            // 🔹 Clear secondary filters (agar inputs hain to setValue(""))
            this.byId("filterBatchNo").setValue("");
            this.byId("filterComponent").setValue("");
            this.byId("filterSite").setValue("");
            this.byId("filterCreatedBy").setValue("");

            // 🔹 Agar track/audit/activity filters bhi input me convert kiye ho to unka reset bhi:
            if (this.byId("trackComponent")) this.byId("trackComponent").setValue("");
            if (this.byId("trackBatchFirst")) this.byId("trackBatchFirst").setValue("");
            if (this.byId("trackDateFirst")) this.byId("trackDateFirst").setValue("");
            if (this.byId("trackBatchRelease")) this.byId("trackBatchRelease").setValue("");

            if (this.byId("auditUser")) this.byId("auditUser").setValue("");
            if (this.byId("auditAction")) this.byId("auditAction").setValue("");
            if (this.byId("auditDate")) this.byId("auditDate").setValue("");
            if (this.byId("auditSite")) this.byId("auditSite").setValue("");

            if (this.byId("activitySite")) this.byId("activitySite").setValue("");
            if (this.byId("activityDetail")) this.byId("activityDetail").setValue("");
            if (this.byId("activityCreatedBy")) this.byId("activityCreatedBy").setValue("");
            if (this.byId("activityCreatedDate")) this.byId("activityCreatedDate").setValue("");

            // 🔹 Reset data + current key
            this._filteredData = null;
            this._currentKey = null;
        },

        onIconTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            this._currentKey = sKey;

            this.byId("summaryFilterBar").setVisible(false);
            this.byId("trackFilterBar").setVisible(false);
            this.byId("auditFilterBar").setVisible(false);
            this.byId("activityFilterBar").setVisible(false);

            if (sKey === "summary") {
                this.byId("summaryFilterBar").setVisible(true);
            } else if (sKey === "track") {
                this.byId("trackFilterBar").setVisible(true);
            } else if (sKey === "audit") {
                this.byId("auditFilterBar").setVisible(true);
            } else if (sKey === "activity") {
                this.byId("activityFilterBar").setVisible(true);
            }

            // 🔹 Table reload logic
            var oModel = this.getView().getModel();
            var aData = (this._filteredData && this._filteredData[sKey])
                ? this._filteredData[sKey]
                : oModel.getData()[sKey];

            this._createTable(sKey, aData);
        },

        onCardPress: function (oEvent) {
            // ✅ IconTabBar se key directly aata hai
            var sKey = oEvent.getParameter("key");
            this._currentKey = sKey;

            // abhi sirf tab select pe table show hoga
            this.byId("tableContainer").setVisible(true);
            this.byId("downloadRow").setVisible(true);

            var oModel = this.getView().getModel();
            var aData = (this._filteredData && this._filteredData[sKey])
                ? this._filteredData[sKey]
                : oModel.getData()[sKey];

            this._createTable(sKey, aData);
        },

        _createTable: function (sKey, aData) {
            var that = this;

            var oTable = new sap.ui.table.Table({
                title: new sap.m.Toolbar({
                    content: [
                        new sap.m.Title({ text: sKey.toUpperCase() + " Data", level: "H3" }),
                        new sap.m.ToolbarSpacer(),
                        new sap.m.Button({
                            text: "Download",
                            icon: "sap-icon://download",
                            type: "Ghost",
                            press: that.onDownloadPress ? that.onDownloadPress.bind(that) : function () {
                                sap.m.MessageToast.show("Download pressed");
                            }
                        })
                    ]
                }),
                visibleRowCountMode: "Auto",   // 👈 Auto adjust rows
                minAutoRowCount: 10,            // 👈 kam se kam 1 row
                maxAutoRowCount: 40,           // 👈 jyada se jyada 10 row
                columnHeaderVisible: true,
                selectionMode: "None",
                enableColumnReordering: true,
                width: "100%"
            });

            if (!aData || aData.length === 0) {
                oTable.addColumn(new sap.ui.table.Column({
                    label: new sap.m.Label({ text: "" }),
                    template: new sap.m.Text({ text: "—" })
                }));

                this.byId("tableContainer").removeAllItems();
                this.byId("tableContainer").addItem(oTable);
                return;
            }

            var aKeys = Object.keys(aData[0]);
            aKeys.forEach(function (sColKey) {
                oTable.addColumn(new sap.ui.table.Column({
                    label: new sap.m.Label({ text: sColKey }),
                    sortProperty: sColKey,           // 👉 Sorting enable
                    showSortMenuEntry: true,         // 👉 Context menu me sorting options
                    showFilterMenuEntry: false,      // 👉 Filter option hide
                    autoResizable: true,
                    template: new sap.m.Text({ text: "{" + sColKey + "}" })
                }));
            });

            var oModel = new sap.ui.model.json.JSONModel({ rows: aData });
            oTable.setModel(oModel);
            oTable.bindRows("/rows");

            this.byId("tableContainer").removeAllItems();
            oTable.addStyleClass("sapUiMediumMarginBottom");
            this.byId("tableContainer").addItem(oTable);
        },

        onDownloadPress: function (oEvent) {
            var that = this;
            if (!this._currentKey) {
                sap.m.MessageToast.show("Please select a card first");
                return;
            }
            if (!this._oActionSheet) {
                this._oActionSheet = new sap.m.ActionSheet({
                    placement: sap.m.PlacementType.Top,
                    buttons: [
                        new sap.m.Button({
                            text: "Download as PDF",
                            press: function () { that._downloadFile("pdf"); }
                        }),
                        new sap.m.Button({
                            text: "Download as Excel",
                            press: function () { that._downloadFile("excel"); }
                        }),
                        new sap.m.Button({
                            text: "Download as CSV",
                            press: function () { that._downloadFile("csv"); }
                        })
                    ]
                });
            }
            this._oActionSheet.openBy(oEvent.getSource());
        },

        _getCurrentTableData: function () {
            if (!this._currentKey) return [];

            var oTable = this.byId("tableContainer").getItems()[0]; // 👈 container me pehla table lo
            if (!oTable) return [];

            var oBinding = oTable.getBinding("rows");
            if (!oBinding) return [];

            // ✅ Binding ke current contexts (filtered + sorted + paginated data)
            return oBinding.getContexts().map(function (oContext) {
                return oContext.getObject();
            });
        },

        _downloadFile: function (sType) {
            var aData = this._getCurrentTableData();  // ✅ ab correct source se data aayega
            if (!aData || aData.length === 0) {
                sap.m.MessageToast.show("No data to download");
                return;
            }
            if (sType === "csv") {
                this._exportCSV(aData);
            } else if (sType === "excel") {
                this._exportExcel(aData);
            } else if (sType === "pdf") {
                this._exportPDF(aData);
            }
        },

        _exportCSV: function (aData) {
            var aCols = Object.keys(aData[0]);
            var sCsv = aCols.join(",") + "\n";

            aData.forEach(function (oRow) {
                var aVals = aCols.map(function (key) { return oRow[key]; });
                sCsv += aVals.join(",") + "\n";
            });

            var blob = new Blob([sCsv], { type: "text/csv;charset=utf-8;" });
            var link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = this._currentKey + ".csv";
            link.click();
        },

        _exportExcel: function (aData) {
            var aCols = Object.keys(aData[0]);
            var sExcel = '<table><tr>';
            aCols.forEach(function (col) { sExcel += "<th>" + col + "</th>"; });
            sExcel += "</tr>";

            aData.forEach(function (oRow) {
                sExcel += "<tr>";
                aCols.forEach(function (key) {
                    sExcel += "<td>" + (oRow[key] || "") + "</td>";
                });
                sExcel += "</tr>";
            });
            sExcel += "</table>";

            var blob = new Blob([sExcel], { type: "application/vnd.ms-excel" });
            var link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = this._currentKey + ".xls";
            link.click();
        },

        _exportPDF: function (aData) {
            var aCols = Object.keys(aData[0]);
            var sHtml = "<h3>" + this._currentKey.toUpperCase() + " Report</h3>" +
                "<table border='1' style='border-collapse:collapse;width:100%'><tr>";

            aCols.forEach(function (col) { sHtml += "<th>" + col + "</th>"; });
            sHtml += "</tr>";

            aData.forEach(function (oRow) {
                sHtml += "<tr>";
                aCols.forEach(function (key) {
                    sHtml += "<td>" + (oRow[key] || "") + "</td>";
                });
                sHtml += "</tr>";
            });
            sHtml += "</table>";

            var win = window.open("", "_blank");
            win.document.write("<html><head><title>Report</title></head><body>" + sHtml + "</body></html>");
            win.print(); // Browser print → Save as PDF option
        },

        // ---------------- SUMMARY FILTERS ----------------

        onAddFilterPress: function (oEvent) {
            var that = this;

            if (!this._oFilterSheet) {
                this._oFilterSheet = new sap.m.ActionSheet({
                    title: "Add Filter",
                    showCancelButton: true,
                    buttons: [
                        new sap.m.Button({ text: "Release", press: function () { that._addFilterField("Release"); } }),
                        new sap.m.Button({ text: "Packing", press: function () { that._addFilterField("Packing"); } }),
                        new sap.m.Button({ text: "Upload", press: function () { that._addFilterField("Upload"); } }),
                        new sap.m.Button({ text: "Comment", press: function () { that._addFilterField("Comment"); } }),
                        new sap.m.Button({ text: "ModifiedDate", press: function () { that._addFilterField("ModifiedDate"); } }),
                        new sap.m.Button({ text: "ModifiedBy", press: function () { that._addFilterField("ModifiedBy"); } }),
                        new sap.m.Button({ text: "CreatedBy", press: function () { that._addFilterField("CreatedBy"); } })
                    ]
                });
                this.getView().addDependent(this._oFilterSheet);
            }
            this._oFilterSheet.openBy(oEvent.getSource());
        },

        _addFilterField: function (sField) {
            this._summaryDynamicFilters = this._summaryDynamicFilters || {};

            if (this._summaryDynamicFilters[sField]) {
                sap.m.MessageToast.show(sField + " filter already added");
                return;
            }

            var sFullId = this.getView().createId("filter" + sField);

            var oLabel = new sap.m.Label({
                text: sField + ":"
            }).addStyleClass(" sapUiTinyMarginEnd");

            var oControl;

            // ✅ Agar Date field hai to DatePicker banao
            var aDateFields = ["Release", "Packing", "Upload", "ModifiedDate"];
            if (aDateFields.includes(sField)) {
                oControl = new sap.m.DatePicker({
                    id: sFullId,
                    width: "150px",
                    valueFormat: "yyyy-MM-dd",   // backend/compare ke liye
                    displayFormat: "dd/MM/yyyy", // user ko show karne ke liye
                    change: this.onSummaryFilter.bind(this)
                }).addStyleClass("sapUiTinyMarginEnd")
                    .data("field", sField);
            } else {
                // Text field
                oControl = new sap.m.Input({
                    id: sFullId,
                    width: "150px",
                    liveChange: this.onSummaryFilter.bind(this)
                }).addStyleClass("sapUiTinyMarginEnd")
                    .data("field", sField);
            }

            this._summaryDynamicFilters[sField] = oControl;

            var oFilterRows = this.byId("filterRows");
            var aRows = oFilterRows.getItems();
            var oLastRow = aRows[aRows.length - 1];

            if (!oLastRow || oLastRow.getItems().length >= 8) {
                oLastRow = new sap.m.HBox({
                    alignItems: "Center",
                    class: "sapUiSmallMarginBottom"
                });
                oFilterRows.addItem(oLastRow);
            }

            oLastRow.addItem(oLabel);
            oLastRow.addItem(oControl);
        },

        onSummaryFilter: function () {
            var that = this;

            var aSource = (this._filteredData && this._filteredData.summary) ?
                this._filteredData.summary :
                (this.getView().getModel() && this.getView().getModel().getData().summary) || [];

            var aFiltered = aSource.filter(function (oItem) {
                var bMatch = true;

                // default filters (XML inputs)
                var aDefaultKeys = ["BatchNo", "Component", "Site", "CreatedBy"];
                aDefaultKeys.forEach(function (sKey) {
                    var oInput = that.byId("filter" + sKey);
                    if (oInput) {
                        var sVal = (oInput.getValue() || "").toLowerCase();
                        if (sVal) {
                            var sFieldVal = (oItem[sKey] || "").toLowerCase();
                            if (!sFieldVal.includes(sVal)) {
                                bMatch = false;
                            }
                        }
                    }
                });

                // ✅ dynamic filters
                if (that._summaryDynamicFilters) {
                    Object.keys(that._summaryDynamicFilters).forEach(function (sField) {
                        var oControl = that._summaryDynamicFilters[sField];
                        if (oControl) {
                            // Agar DatePicker hai
                            if (oControl instanceof sap.m.DatePicker) {
                                var oVal = oControl.getDateValue(); // Date object
                                if (oVal) {
                                    var dField = that._parseDate(oItem[sField]);
                                    if (!dField || dField.toDateString() !== oVal.toDateString()) {
                                        bMatch = false;
                                    }
                                }
                            } else {
                                // Input (text)
                                var sVal = (oControl.getValue() || "").toLowerCase();
                                if (sVal) {
                                    var sFieldVal = (oItem[sField] || "").toLowerCase();
                                    if (!sFieldVal.includes(sVal)) {
                                        bMatch = false;
                                    }
                                }
                            }
                        }
                    });
                }
                return bMatch;
            });

            this._createTable("summary", aFiltered);
        },

        onSummaryFilterReset: function () {
            var that = this;

            // reset default inputs (XML ones)
            ["BatchNo", "Component", "Site", "CreatedBy"].forEach(function (sKey) {
                var oInput = that.byId("filter" + sKey);
                if (oInput) {
                    oInput.setValue("");
                }
            });

            // ✅ destroy dynamic filters completely
            var oFilterRows = this.byId("filterRows");
            oFilterRows.destroyItems();   // puri tarah remove + destroy
            this._summaryDynamicFilters = {}; // clear references

            // refresh table data
            var aSource = (this._filteredData && this._filteredData.summary) ?
                this._filteredData.summary :
                (this.getView().getModel() && this.getView().getModel().getData().summary) || [];

            this._createTable("summary", aSource);
        },

        // ---------------- TRACK FILTERS ----------------
        onTrackAddFilter: function (oEvent) {
            var that = this;

            if (!this._oTrackFilterSheet) {
                this._oTrackFilterSheet = new sap.m.ActionSheet({
                    title: "Add Filter",
                    showCancelButton: true,
                    buttons: [
                        new sap.m.Button({ text: "DateRelease", press: function () { that._addTrackFilterField("DateRelease"); } }),
                        new sap.m.Button({ text: "BatchLast", press: function () { that._addTrackFilterField("BatchLast"); } }),
                        new sap.m.Button({ text: "DateLast", press: function () { that._addTrackFilterField("DateLast"); } }),
                        new sap.m.Button({ text: "BatchReleaseLast", press: function () { that._addTrackFilterField("BatchReleaseLast"); } }),
                        new sap.m.Button({ text: "DateReleaseLast", press: function () { that._addTrackFilterField("DateReleaseLast"); } })
                    ]
                });
                this.getView().addDependent(this._oTrackFilterSheet);
            }

            this._oTrackFilterSheet.openBy(oEvent.getSource());
        },

        _addTrackFilterField: function (sField) {
            this._trackDynamicFilters = this._trackDynamicFilters || {};

            if (this._trackDynamicFilters[sField]) {
                sap.m.MessageToast.show(sField + " filter already added");
                return;
            }

            var sFullId = this.getView().createId("track" + sField);

            var oLabel = new sap.m.Label({ text: sField + ":" })
                .addStyleClass("sapUiTinyMarginBegin sapUiTinyMarginEnd");

            var oControl;
            // ✅ Date fields list
            var aDateFields = ["DateRelease", "DateLast", "DateReleaseLast"];

            if (aDateFields.includes(sField)) {
                oControl = new sap.m.DatePicker({
                    id: sFullId,
                    width: "150px",
                    valueFormat: "yyyy-MM-dd",   // backend storage
                    displayFormat: "dd/MM/yyyy", // user friendly
                    change: this.onTrackFilter.bind(this)
                }).addStyleClass("sapUiTinyMarginEnd")
                    .data("field", sField);
            } else {
                oControl = new sap.m.Input({
                    id: sFullId,
                    width: "150px",
                    liveChange: this.onTrackFilter.bind(this)
                }).addStyleClass("sapUiTinyMarginEnd")
                    .data("field", sField);
            }

            this._trackDynamicFilters[sField] = oControl;

            var oFilterRows = this.byId("trackFilterRows");
            var aRows = oFilterRows.getItems();
            var oLastRow = aRows[aRows.length - 1];

            if (!oLastRow || oLastRow.getItems().length >= 8) {
                oLastRow = new sap.m.HBox({
                    alignItems: "Center",
                    class: "sapUiSmallMarginBottom"
                });
                oFilterRows.addItem(oLastRow);
            }

            oLastRow.addItem(oLabel);
            oLastRow.addItem(oControl);
        },

        onTrackFilter: function () {
            var that = this;
            var oModel = this.getView().getModel();
            var aBaseData = (this._filteredData && this._filteredData.track)
                ? this._filteredData.track
                : oModel.getData().track;

            var aFiltered = aBaseData.filter(function (oItem) {
                var bMatch = true;

                // ✅ default filters
                var sComp = that.byId("trackComponent").getValue().toLowerCase();
                var sBatchFirst = that.byId("trackBatchFirst").getValue().toLowerCase();
                var sBatchRelease = that.byId("trackBatchRelease").getValue().toLowerCase();

                if (sComp && !(oItem.Component || "").toLowerCase().includes(sComp)) bMatch = false;
                if (sBatchFirst && !(oItem.BatchFirst || "").toLowerCase().includes(sBatchFirst)) bMatch = false;
                if (sBatchRelease && !(oItem.BatchRelease || "").toLowerCase().includes(sBatchRelease)) bMatch = false;

                // ✅ DateFirst (default date filter)
                var oDateFirst = that.byId("trackDateFirst").getDateValue(); // direct Date object
                if (oDateFirst) {
                    var dValue = that._parseDate(oItem.DateFirst);
                    if (!dValue || dValue.toDateString() !== oDateFirst.toDateString()) {
                        bMatch = false;
                    }
                }

                // ✅ dynamic filters
                if (that._trackDynamicFilters) {
                    Object.keys(that._trackDynamicFilters).forEach(function (sField) {
                        var oControl = that._trackDynamicFilters[sField];
                        if (oControl) {
                            if (oControl instanceof sap.m.DatePicker) {
                                var oVal = oControl.getDateValue();
                                if (oVal) {
                                    var dField = that._parseDate(oItem[sField]);
                                    if (!dField || dField.toDateString() !== oVal.toDateString()) {
                                        bMatch = false;
                                    }
                                }
                            } else {
                                var sVal = (oControl.getValue() || "").toLowerCase();
                                if (sVal) {
                                    var sFieldVal = (oItem[sField] || "").toLowerCase();
                                    if (!sFieldVal.includes(sVal)) {
                                        bMatch = false;
                                    }
                                }
                            }
                        }
                    });
                }
                return bMatch;
            });

            this._createTable("track", aFiltered);
        },

        onTrackFilterReset: function () {
            var that = this;

            // reset default inputs
            ["Component", "BatchFirst", "DateFirst", "BatchRelease"].forEach(function (sKey) {
                var oInput = that.byId("track" + sKey);
                if (oInput) {
                    oInput.setValue("");
                }
            });

            // destroy dynamic filters
            var oFilterRows = this.byId("trackFilterRows");
            oFilterRows.destroyItems();
            this._trackDynamicFilters = {};

            // refresh table
            var aSource = (this._filteredData && this._filteredData.track)
                ? this._filteredData.track
                : this.getView().getModel().getData().track;

            this._createTable("track", aSource);
        },

        //====================== Audit Filter ======================
        onAuditFilter: function () {
            var oModel = this.getView().getModel();
            var aBaseData = (this._filteredData && this._filteredData.audit)
                ? this._filteredData.audit
                : oModel.getData().audit;

            var sUser = this.byId("auditUser").getValue().toLowerCase();
            var sAction = this.byId("auditAction").getValue().toLowerCase();
            var oDate = this.byId("auditDate").getDateValue();   // 👈 direct Date object
            var sSite = this.byId("auditSite").getValue().toLowerCase();
            var that = this;

            var aFiltered = aBaseData.filter(function (oItem) {
                var bMatch = true;

                if (sUser && !(oItem.User || "").toLowerCase().includes(sUser)) bMatch = false;
                if (sAction && !(oItem.Action || "").toLowerCase().includes(sAction)) bMatch = false;
                if (sSite && !(oItem.Site || "").toLowerCase().includes(sSite)) bMatch = false;

                if (oDate) {
                    var dValue = that._parseDate(oItem.Date);
                    if (!dValue || dValue.toDateString() !== oDate.toDateString()) {
                        bMatch = false;
                    }
                }

                return bMatch;
            });

            this._createTable("audit", aFiltered);
        },

        // ---------------- ACTIVITY FILTERS ----------------
        onActivityFilter: function () {
            var oModel = this.getView().getModel();
            var aBaseData = (this._filteredData && this._filteredData.activity)
                ? this._filteredData.activity
                : oModel.getData().activity;

            var sSite = this.byId("activitySite").getValue().toLowerCase();
            var sDetail = this.byId("activityDetail").getValue().toLowerCase();
            var sCreatedBy = this.byId("activityCreatedBy").getValue().toLowerCase();
            var oCreatedDate = this.byId("activityCreatedDate").getDateValue();

            var that = this;

            var aFiltered = aBaseData.filter(function (oItem) {
                var bMatch = true;

                if (sSite && !(oItem.Site || "").toLowerCase().includes(sSite)) bMatch = false;
                if (sDetail && !(oItem.Detail || "").toLowerCase().includes(sDetail)) bMatch = false;
                if (sCreatedBy && !(oItem.CreatedBy || "").toLowerCase().includes(sCreatedBy)) bMatch = false;

                if (oCreatedDate) {
                    var dValue = that._parseDate(oItem.CreatedDate);
                    if (!dValue || dValue.toDateString() !== oCreatedDate.toDateString()) {
                        bMatch = false;
                    }
                }
                return bMatch;
            });
            this._createTable("activity", aFiltered);
        },

        onAuditFilterReset: function () {
            this.byId("auditUser").setValue("");
            this.byId("auditAction").setValue("");
            this.byId("auditDate").setValue("");
            this.byId("auditSite").setValue("");
            this._createTable("audit", this._filteredData.audit);
        },

        onActivityFilterReset: function () {
            this.byId("activitySite").setValue("");
            this.byId("activityDetail").setValue("");
            this.byId("activityCreatedBy").setValue("");
            this.byId("activityCreatedDate").setValue("");
            this._createTable("activity", this._filteredData.activity);
        }

    });
});
