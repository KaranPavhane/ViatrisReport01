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
                //Packaging Site code
                ProductCollection: [
                    { Name: "C001" },
                    { Name: "C002" },
                    { Name: "C003" },
                    { Name: "C004" },
                    { Name: "C005" }
                ],

                summary: [],

                track: [],

                audit: [],

                activity: []
            };

            // Reports
            this._reportTitles = {
                summary: "Packaging and Release Site Summary Report",
                track: "Track Wise Report",
                audit: "Audit Trail Report",
                activity: "Packaging and Release Site Activity"
            };

            // column Mapping 
            this._columnMapping = {
                batchNo: "Batch No.",
                comments: "Comments",
                compCode: "Componant Code",
                createdAt: "Created At",
                createdBy: "Created By",
                createdDate: "Created Date",
                modifiedAt: "Modified At",
                modifiedBy: "Modified By",
                packingDate: "Packing Date",
                pkgSite: "Packaging Site",
                releaseDate: "Release Date",
                packagingSiteID: "Packaging Site ID",
                user: "User",
                lastActivityDate: "Last Activity Date",
                todayDate: "Today Date",
                daysFromToday: "Days From Today"
            };

            // Hide column to showing in table
            this._ignoredColumns = ["ID", "isdel"];

            var oModel = new sap.ui.model.json.JSONModel(oData);
            this.getView().setModel(oModel);

            this._currentKey = null;
            this._oSelectedCard = null;

            // on load page only filterbar showing 
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
                oMultiInput.setShowSuggestion(true);
                oMultiInput.openSuggestions();
            }
        },

        onFromDateChange: function (oEvent) {
            var oFromDate = oEvent.getSource().getDateValue();
            var oToDatePicker = this.byId("toDate");

            if (oFromDate) {
                // enable To Date
                oToDatePicker.setEnabled(true);
                // also restrict min date
                oToDatePicker.setMinDate(oFromDate);
            } else {
                // reset To Date if From Date cleared
                oToDatePicker.setValue("");
                oToDatePicker.setEnabled(false);
            }
        },

        onToDateChange: function (oEvent) {
            var oToDate = oEvent.getSource().getDateValue();
            var oFromDate = this.byId("fromDate").getDateValue();

            if (!oFromDate && oToDate) {
                sap.m.MessageToast.show("Please select From Date first");
                oEvent.getSource().setValue(""); // reset To Date
            }
        },


        onFilterGo: function () {

            var oFrom = this.byId("fromDate").getDateValue();
            var oTo = this.byId("toDate").getDateValue();

            if (!oFrom || !oTo) {
                sap.m.MessageToast.show("Please select both From and To dates");
                return;
            }

            if (oFrom > oTo) {
                sap.m.MessageToast.show("From Date cannot be greater than To Date");
                return;
            }

            oTo.setHours(23, 59, 59, 999);

            var oModel = this.getView().getModel();
            var oData = oModel.getData();
            var that = this;

            this._filteredData = {};

            // Fetch Summary Reports Data 
            $.ajax({
                url: "/odata/v4/document/BatchData",
                method: "GET",
                contentType: "application/json",
                success: function (oResponse) {
                    var aSummary = oResponse.value || [];

                    var aColumnOrder = [
                        "batchNo",
                        "compCode",
                        "releaseDate",
                        "packingDate",
                        "createdAt",
                        "pkgSite",
                        "comments",
                        "createdBy",
                        "modifiedAt",
                        "modifiedBy"
                    ];

                    var aReordered = aSummary.map(function (item) {
                        var newObj = {};
                        aColumnOrder.forEach(function (key) {
                            newObj[key] = item[key] || "";
                        });
                        return newObj;
                    });

                    console.log("✅ Reordered Summary:", aReordered);

                    var oModel = that.getView().getModel();
                    oModel.setProperty("/summary", aReordered);

                    that._filteredData.summary = aReordered;

                    if (that._currentKey === "summary") {
                        that._createTable("summary", aReordered);
                    }
                },
                error: function (xhr, status, error) {
                    console.error("❌ Error loading BatchData:", status, error);
                    console.error("Response:", xhr.responseText);
                    var oModel = that.getView().getModel();
                    oModel.setProperty("/summary", []);
                    that._filteredData.summary = [];
                }
            });

            //Get Trackwise Report 
            $.ajax({
                url: "/odata/v4/document/GetTrackwiseReport",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    fromDate: oFrom.toISOString().split("T")[0],
                    toDate: oTo.toISOString().split("T")[0]
                }),
                success: function (res) {
                    var aTrack = res.results || [];

                    // ✅ Define required column order
                    var aColumnOrder = [
                        "Packging Site Component Code", // Component Code
                        "Batch No. of First Packaging",
                        "Date of First Packaging",
                        "Batch No. of First Release",
                        "Date of First Release",
                        "Batch No. of Last Packaging",
                        "Date of Last Packaging",
                        "Batch No. of Last Release",
                        "Date of Last Release",
                        "Packaging Site Code",
                        "Packaging Site Name"
                    ];

                    // ✅ Reorder each row according to column order
                    var aReordered = aTrack.map(function (item) {
                        var newObj = {};
                        aColumnOrder.forEach(function (key) {
                            newObj[key] = item[key] || "";
                        });
                        return newObj;
                    });

                    console.log("✅ Trackwise Report (Reordered):", aReordered);

                    // set to model
                    that.getView().getModel().setProperty("/track", aReordered);
                    that._filteredData.track = aReordered;

                    if (that._currentKey === "track") {
                        that._createTable("track", aReordered);
                    }
                },
                error: function (xhr, status, error) {
                    console.error("❌ Error:", status, error);
                    console.error("Response:", xhr.responseText);
                    that._filteredData.track = [];
                }
            });


            // Audit and Activity Data fetch
            // Audit and Activity Data fetch
            $.ajax({
                url: "/odata/v4/document/AuditTrial",
                method: "GET",
                contentType: "application/json",
                context: this,
                success: function (res) {
                    var aAudit = res.value || [];

                    // ✅ Define required column order for Audit
                    var aColumnOrder = [
                        "batchNo",      // Batch No
                        "compCode",     // Component Code
                        "releaseDate",  // Release Date
                        "packingDate",  // Packing Date
                        "createdAt",    // Date of Upload [time stamp]
                        "pkgSite",      // Packaging SITE ID-NAME
                        "comments",     // Comment
                        "createdBy",    // Created By
                        "modifiedAt",   // Modified Date
                        "modifiedBy"    // Modified By
                    ];

                    // ✅ Reorder audit data
                    var aReorderedAudit = aAudit.map(function (item) {
                        var newObj = {};
                        aColumnOrder.forEach(function (key) {
                            newObj[key] = item[key] || "";
                        });
                        return newObj;
                    });

                    this.getView().getModel().setProperty("/audit", aReorderedAudit);
                    this._filteredData.audit = aReorderedAudit;

                    console.log("✅ Audit Data (Reordered):", aReorderedAudit);

                    // collect pkgSites & createdBys
                    var aPkgSites = [...new Set(aReorderedAudit.map(item => item.pkgSite).filter(Boolean))];
                    var aCreatedBys = [...new Set(aReorderedAudit.map(item => item.createdBy).filter(Boolean))];

                    // Activity fetch
                    $.ajax({
                        url: "/odata/v4/document/activityReport",
                        method: "POST",
                        contentType: "application/json",
                        data: JSON.stringify({
                            pkgSites: aPkgSites,
                            createdBys: aCreatedBys
                        }),
                        context: this,
                        success: function (oData) {
                            console.log("✅ Activity Report Response:", oData);

                            this._filteredData.activity = oData.value || oData;

                            var oLocalModel = new sap.ui.model.json.JSONModel(this._filteredData);
                            this.getView().setModel(oLocalModel, "local");
                        },
                        error: function (xhr, status, error) {
                            console.error("❌ Activity Report call failed:", xhr.responseText);
                            this._filteredData.activity = [];
                        }
                    });
                },
                error: function (xhr, status, error) {
                    console.error("❌ Error fetching AuditTrial:", status, error);
                    console.error("Response:", xhr.responseText);
                    this._filteredData.audit = [];
                }
            });


            // Default tab --> summary
            this._currentKey = "summary";
            this.byId("cardsRow").setVisible(true);
            this.byId("cardsRow").setSelectedKey("summary");
            this.byId("tableContainer").setVisible(true);
            this.byId("downloadRow").setVisible(true);

            this._createTable("summary", this._filteredData.summary);

            this.byId("summaryFilterBar").setVisible(false);
            this.byId("trackFilterBar").setVisible(false);
            this.byId("auditFilterBar").setVisible(false);
            this.byId("activityFilterBar").setVisible(false);

            this.byId("summaryFilterBar").setVisible(true);
        },

        _parseDate: function (sDate) {
            if (!sDate) return null;
            var parts = sDate.split("/"); // dd/mm/yyyy
            if (parts.length !== 3) return null;
            return new Date(parts[2], parts[1] - 1, parts[0]);
        },

        // after click on reset button
        onFilterReset: function () {

            this.byId("productInput").removeAllTokens();

            this.byId("fromDate").setValue("");
            this.byId("toDate").setValue("");

            this.byId("cardsRow").setVisible(false);
            this.byId("tableContainer").setVisible(false);
            this.byId("downloadRow").setVisible(false);

            this.byId("summaryFilterBar").setVisible(false);
            this.byId("trackFilterBar").setVisible(false);
            this.byId("auditFilterBar").setVisible(false);
            this.byId("activityFilterBar").setVisible(false);

            this.byId("filterBatchNo").setValue("");
            this.byId("filterComponent").setValue("");
            this.byId("filterSite").setValue("");
            this.byId("filterCreatedBy").setValue("");

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

            this._filteredData = null;
            this._currentKey = null;
        },

        // select icon Tabs
        onIconTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            this._currentKey = sKey;

            this.byId("summaryFilterBar").setVisible(false);
            this.byId("trackFilterBar").setVisible(false);
            this.byId("auditFilterBar").setVisible(false);
            this.byId("activityFilterBar").setVisible(false);

            var oModel = this.getView().getModel();
            var aData = [];

            if (sKey === "summary") {
                this.byId("summaryFilterBar").setVisible(true);
                aData = oModel.getProperty("/summary") || [];

            } else if (sKey === "track") {
                this.byId("trackFilterBar").setVisible(true);
                aData = (this._filteredData && this._filteredData.track)
                    ? this._filteredData.track
                    : (oModel.getProperty("/track") || []);

            } else if (sKey === "audit") {
                this.byId("auditFilterBar").setVisible(true);
                aData = (this._filteredData && this._filteredData.audit)
                    ? this._filteredData.audit
                    : (oModel.getProperty("/audit") || []);

            } else if (sKey === "activity") {
                this.byId("activityFilterBar").setVisible(true);
                aData = (this._filteredData && this._filteredData.activity)
                    ? this._filteredData.activity
                    : (oModel.getProperty("/activity") || []);
            }

            this._createTable(sKey, aData);
        },

        // after click on cards set Visible true
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

        // Create Table
        _createTable: function (sKey, aData) {
            var that = this;

            var sTitle = this._reportTitles[sKey] || (sKey.toUpperCase() + " Data");

            var oTable = new sap.ui.table.Table({
                title: new sap.m.Toolbar({
                    content: [
                        new sap.m.Title({ text: sTitle, level: "H3" }),
                        new sap.m.ToolbarSpacer(),
                        new sap.m.Button({
                            text: "Download",
                            icon: "sap-icon://download",
                            type: "Ghost",
                            press: function (oEvent) {
                                that._currentKey = sKey;
                                that.onDownloadPress(oEvent);
                            }
                        })
                    ]
                }),
                visibleRowCountMode: "Fixed",
                visibleRowCount: 8,
                minAutoRowCount: 5,
                columnHeaderVisible: true,
                selectionMode: "None",
                enableColumnReordering: true,
                width: "100%",   // ✅ Full width
                rowHeight: 15
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
                if (that._ignoredColumns && that._ignoredColumns.includes(sColKey)) {
                    return;
                }

                var sColLabel = that._columnMapping[sColKey] || sColKey;

                var oColumn = new sap.ui.table.Column({
                    label: new sap.m.Label({ text: sColLabel }),
                    sortProperty: sColKey,
                    showSortMenuEntry: true,
                    showFilterMenuEntry: false,
                    template: new sap.m.Text({ text: "{" + sColKey + "}", wrapping: true })
                });

                oTable.addColumn(oColumn);
            });

            var oModel = new sap.ui.model.json.JSONModel({ rows: aData });
            oTable.setModel(oModel);
            oTable.bindRows("/rows");

            // ✅ Equal column width adjustment after rendering
            oTable.attachEventOnce("rowsUpdated", function () {
                setTimeout(function () {
                    var iTableWidth = oTable.$().width();
                    var aColumns = oTable.getColumns();
                    var iColCount = aColumns.length;

                    if (iColCount > 0 && iTableWidth > 0) {
                        var iEqualWidth = Math.floor(iTableWidth / iColCount) + "px";

                        aColumns.forEach(function (oCol) {
                            oCol.setWidth(iEqualWidth);
                        });
                    }
                }, 200);
            });

            this.byId("tableContainer").removeAllItems();
            oTable.addStyleClass("customDataTable");
            this.byId("tableContainer").addItem(oTable);
        },

        // showing select option for download 
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
            this._oActionSheet.openBy(oEvent.getSource()); // ✅ button ke upar ActionSheet open hoga
        },

        // Get Current Table Data
        _getCurrentTableData: function () {
            if (!this._currentKey) return [];

            var oTable = this.byId("tableContainer").getItems()[0];
            if (!oTable) return [];

            var oBinding = oTable.getBinding("rows");
            if (!oBinding) return [];

            return oBinding.getContexts().map(function (oContext) {
                return oContext.getObject();
            });
        },

        // after click on download button
        _downloadFile: function (sType) {
            var aData = this._getCurrentTableData();
            if (!aData || aData.length === 0) {
                sap.m.MessageToast.show("No data to download");
                return;
            }
            var sTitle = this._reportTitles[this._currentKey] || (this._currentKey.toUpperCase() + " Report");

            if (sType === "csv") {
                this._exportCSV(aData, sTitle);
            } else if (sType === "excel") {
                this._exportExcel(aData, sTitle);
            } else if (sType === "pdf") {
                this._exportPDF(aData, sTitle);
            }
        },

        //Download as CSV
        _exportCSV: function (aData, sTitle) {
            var that = this;
            var aCols = Object.keys(aData[0]).filter(function (key) {
                return !(that._ignoredColumns && that._ignoredColumns.includes(key));
            });

            var aHeaders = aCols.map(function (key) {
                return that._columnMapping[key] || key;
            });
            var sCsv = aHeaders.join(",") + "\n";

            aData.forEach(function (oRow) {
                var aVals = aCols.map(function (key) { return oRow[key]; });
                sCsv += aVals.join(",") + "\n";
            });

            var blob = new Blob([sCsv], { type: "text/csv;charset=utf-8;" });
            var link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = sTitle + ".csv";
            link.click();
        },

        // Download as Excel
        _exportExcel: function (aData, sTitle) {
            var that = this;
            var aCols = Object.keys(aData[0]).filter(function (key) {
                return !(that._ignoredColumns && that._ignoredColumns.includes(key));
            });

            var sExcel = '<table border="1"><tr>';
            aCols.forEach(function (col) {
                var sLabel = that._columnMapping[col] || col;
                sExcel += "<th>" + sLabel + "</th>";
            });
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
            link.download = sTitle + ".xls";
            link.click();
        },

        // Download as PDF
        _exportPDF: function (aData, sTitle) {
            var that = this;
            if (!aData || !aData.length) { return; }

            function escHtml(str) {
                if (str === null || str === undefined) return "";
                return String(str)
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#39;");
            }

            var aCols = Object.keys(aData[0]).filter(function (key) {
                return !(that._ignoredColumns && that._ignoredColumns.includes(key));
            });

            var sLogoPath = sap.ui.require.toUrl("project1/img/VIATRIS_Logo.png");
            var sBgPath = sap.ui.require.toUrl("project1/img/background_img_pdf.jpg");

            // Table build
            var sTable = "<table><thead><tr>";
            aCols.forEach(function (col) {
                var sLabel = that._columnMapping && that._columnMapping[col] ? that._columnMapping[col] : col;
                sTable += "<th>" + escHtml(sLabel) + "</th>";
            });
            sTable += "</tr></thead><tbody>";

            aData.forEach(function (oRow) {
                sTable += "<tr>";
                aCols.forEach(function (key) {
                    sTable += "<td>" + escHtml(oRow[key] || "") + "</td>";
                });
                sTable += "</tr>";
            });
            sTable += "</tbody></table>";

            var sStyle = `
        <style>
            @page { size: A4 landscape; margin: 0; }
            html, body {
                height: 100%;
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            body {
                margin: 0;
                padding: 20px;
                box-sizing: border-box;
                position: relative;
            }
            body::before {
                content: "";
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background-image: url('${sBgPath}');
                background-position: center;
                background-repeat: no-repeat;
                background-size: cover;
                z-index: -1;
            }
            .container { width:100%; }
            .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
            .header h3 { margin:0; font-size:20px; }
            .logo { height:60px; }
            table { width:100%; border-collapse: collapse; background: transparent; }
            thead th { font-weight:bold; }
            th, td {
                border:1px solid #000;
                padding:6px 8px;
                background: transparent !important;
                color: #000;
                word-wrap: break-word;
                white-space: normal;
            }
            tr { page-break-inside: avoid; }
        </style>
        `;

            var sHeaderHtml = '<div class="header">' +
                '<h3>' + escHtml(sTitle) + '</h3>' +
                '<img class="logo" src="' + sLogoPath + '" alt="Logo" style="height:100px;" />' +
                '</div>';

            var fullHtml = "<!doctype html><html><head><meta charset='utf-8'><title>" + escHtml(sTitle) + "</title>" + sStyle + "</head><body>" +
                "<div class='container'>" + sHeaderHtml + sTable + "</div>" +
                "</body></html>";

            // ✅ Create hidden iframe
            var iframe = document.createElement('iframe');
            iframe.style.position = "fixed";
            iframe.style.right = "0";
            iframe.style.bottom = "0";
            iframe.style.width = "0";
            iframe.style.height = "0";
            iframe.style.border = "0";
            document.body.appendChild(iframe);

            // Write content to iframe
            iframe.contentDocument.open();
            iframe.contentDocument.write(fullHtml);
            iframe.contentDocument.close();

            // Print after small delay
            setTimeout(function () {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();

                // remove iframe after print (cleanup)
                setTimeout(function () {
                    document.body.removeChild(iframe);
                }, 2000);
            }, 700);
        },

        // ---------------- SUMMARY FILTERS ----------------
        onAddFilterPress: function (oEvent) {
            var that = this;

            if (!this._oFilterSheet) {
                var aFields = [
                    "releaseDate", "packingDate", "createdDate", "createdAt", "modifiedAt",
                    "comments", "modifiedBy"
                ];

                var aButtons = aFields.map(function (sField) {
                    return new sap.m.Button({
                        text: that._columnMapping[sField] || sField,
                        press: function () { that._addFilterField(sField); }
                    });
                });

                this._oFilterSheet = new sap.m.ActionSheet({
                    title: "Add Filter",
                    showCancelButton: true,
                    buttons: aButtons
                });
                this.getView().addDependent(this._oFilterSheet);
            }
            this._oFilterSheet.openBy(oEvent.getSource());
        },

        _addFilterField: function (sField) {
            this._summaryDynamicFilters = this._summaryDynamicFilters || {};

            if (this._summaryDynamicFilters[sField]) {
                sap.m.MessageToast.show((this._columnMapping[sField] || sField) + " filter already added");
                return;
            }

            var sFullId = this.getView().createId("filter" + sField);

            var oLabel = new sap.m.Label({
                text: (this._columnMapping[sField] || sField) + ":"
            }).addStyleClass("sapUiTinyMarginEnd");

            var oControl;
            var aDateFields = ["releaseDate", "packingDate", "createdDate", "modifiedAt", "createdAt"];

            if (aDateFields.includes(sField)) {
                oControl = new sap.m.DatePicker({
                    id: sFullId,
                    width: "150px",
                    valueFormat: "yyyy-MM-dd",
                    displayFormat: "dd/MM/yyyy",
                    change: this.onSummaryFilter.bind(this)
                }).addStyleClass("sapUiTinyMarginEnd")
                    .data("field", sField);
            } else {
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

                // 🔹 Loop over all filter inputs (default + dynamic)
                var oAllFilters = Object.assign({}, that._summaryDynamicFilters || {});

                // default filters bhi include kar do
                ["batchNo", "compCode", "pkgSite", "createdBy", "comments", "modifiedBy"].forEach(function (sKey) {
                    var oInput = that.byId("filter" + sKey);
                    if (oInput) {
                        oAllFilters[sKey] = oInput;
                    }
                });

                // 🔹 Apply all filters
                Object.keys(oAllFilters).forEach(function (sField) {
                    var oControl = oAllFilters[sField];
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
                });

                return bMatch;
            });

            this._createTable("summary", aFiltered);
        },

        onSummaryFilterReset: function () {
            var that = this;

            ["batchNo", "compCode", "pkgSite", "createdBy", "comments", "modifiedBy"].forEach(function (sKey) {
                var oInput = that.byId("filter" + sKey);
                if (oInput) {
                    oInput.setValue("");
                }
            });

            var oFilterRows = this.byId("filterRows");
            oFilterRows.destroyItems();
            this._summaryDynamicFilters = {};

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
                        new sap.m.Button({ text: "Date of First Packaging", press: function () { that._addTrackFilterField("Date of First Packaging"); } }),
                        new sap.m.Button({ text: "Date of First Release", press: function () { that._addTrackFilterField("Date of First Release"); } }),
                        new sap.m.Button({ text: "Date of Last Packaging", press: function () { that._addTrackFilterField("Date of Last Packaging"); } }),
                        new sap.m.Button({ text: "Date of Last Release", press: function () { that._addTrackFilterField("Date of Last Release"); } }),
                        new sap.m.Button({ text: "Batch No. of Last Packaging", press: function () { that._addTrackFilterField("Batch No. of Last Packaging"); } }),
                        new sap.m.Button({ text: "Batch No. of Last Release", press: function () { that._addTrackFilterField("Batch No. of Last Release"); } }),
                        new sap.m.Button({ text: "Packaging Site Code", press: function () { that._addTrackFilterField("Packaging Site Code"); } }),
                        new sap.m.Button({ text: "Packaging Site Name", press: function () { that._addTrackFilterField("Packaging Site Name"); } })
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

            var sFullId = this.getView().createId("track" + sField.replace(/\s+/g, "")); // spaces remove

            var oLabel = new sap.m.Label({ text: sField + ":" })
                .addStyleClass("sapUiTinyMarginBegin sapUiTinyMarginEnd");

            var oControl;
            var aDateFields = [
                "Date of First Packaging",
                "Date of First Release",
                "Date of Last Packaging",
                "Date of Last Release"
            ];

            if (aDateFields.includes(sField)) {
                oControl = new sap.m.DatePicker({
                    id: sFullId,
                    width: "150px",
                    valueFormat: "yyyy-MM-dd",
                    displayFormat: "dd/MM/yyyy",
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

                // 🔹 default filters
                var sComp = (that.byId("trackPackgingSiteComponentCode").getValue() || "").toLowerCase();
                var sBatchFirstPkg = (that.byId("trackBatchNoOfFirstPackaging").getValue() || "").toLowerCase();
                var sBatchFirstRelease = (that.byId("trackBatchNoOfFirstRelease").getValue() || "").toLowerCase();

                if (sComp && !(oItem["Packging Site Component Code"] || "").toLowerCase().includes(sComp)) bMatch = false;
                if (sBatchFirstPkg && !(oItem["Batch No. of First Packaging"] || "").toLowerCase().includes(sBatchFirstPkg)) bMatch = false;
                if (sBatchFirstRelease && !(oItem["Batch No. of First Release"] || "").toLowerCase().includes(sBatchFirstRelease)) bMatch = false;

                // 🔹 dynamic filters
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

            // reset default inputs (3 only)
            [
                "PackgingSiteComponentCode",
                "BatchNoOfFirstPackaging",
                "BatchNoOfFirstRelease"
            ].forEach(function (sKey) {
                var oInput = that.byId("track" + sKey);
                if (oInput) {
                    if (oInput.setValue) oInput.setValue("");
                    if (oInput.setDateValue) oInput.setDateValue(null);
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

        _parseDate: function (sValue) {
            if (!sValue) return null;
            if (sValue instanceof Date) return sValue;

            // assume format yyyy-MM-dd
            var parts = sValue.split("-");
            if (parts.length === 3) {
                return new Date(parts[0], parts[1] - 1, parts[2]);
            }
            return new Date(sValue);
        },



        //====================== Audit Filter ======================
        onAuditAddFilter: function (oEvent) {
            var that = this;
            if (!this._oAuditFilterSheet) {
                this._oAuditFilterSheet = new sap.m.ActionSheet({
                    title: "Add Filter",
                    showCancelButton: true,
                    buttons: [
                        new sap.m.Button({ text: "Comments", press: () => that._addAuditFilterField("comments") }),
                        new sap.m.Button({ text: "Packaging Site", press: () => that._addAuditFilterField("pkgSite") }),
                        new sap.m.Button({ text: "Packing Date", press: () => that._addAuditFilterField("packingDate", true) }),
                        new sap.m.Button({ text: "Modified At", press: () => that._addAuditFilterField("modifiedAt", true) }),
                        new sap.m.Button({ text: "Created At", press: () => that._addAuditFilterField("createdAt", true) }),
                        new sap.m.Button({ text: "Release Date", press: () => that._addAuditFilterField("releaseDate", true) })
                    ]
                });
                this.getView().addDependent(this._oAuditFilterSheet);
            }
            this._oAuditFilterSheet.openBy(oEvent.getSource());
        },

        _addAuditFilterField: function (sField, bIsDate) {
            this._auditDynamicFilters = this._auditDynamicFilters || {};

            if (this._auditDynamicFilters[sField]) {
                sap.m.MessageToast.show(sField + " filter already added");
                return;
            }

            var sFullId = this.getView().createId("audit" + sField);

            var oLabel = new sap.m.Label({ text: sField + ":" })
                .addStyleClass("sapUiTinyMarginEnd");

            var oControl;
            if (bIsDate) {
                oControl = new sap.m.DatePicker({
                    id: sFullId,
                    width: "150px",
                    valueFormat: "yyyy-MM-dd",
                    displayFormat: "dd/MM/yyyy",
                    change: this.onAuditFilter.bind(this)
                }).addStyleClass("sapUiTinyMarginEnd")
                    .data("field", sField);
            } else {
                oControl = new sap.m.Input({
                    id: sFullId,
                    width: "150px",
                    liveChange: this.onAuditFilter.bind(this)
                }).addStyleClass("sapUiTinyMarginEnd")
                    .data("field", sField);
            }

            this._auditDynamicFilters[sField] = oControl;

            var oFilterRows = this.byId("auditFilterRows");
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

        onAuditFilter: function () {
            var that = this;
            var oModel = this.getView().getModel();
            var aBaseData = oModel.getData().audit || [];

            var sBatchNo = (this.byId("auditBatchNo")?.getValue() || "").toLowerCase();
            var sCreatedBy = (this.byId("auditCreatedBy")?.getValue() || "").toLowerCase();
            var sModifiedBy = (this.byId("auditModifiedBy")?.getValue() || "").toLowerCase();
            var sCompCode = (this.byId("auditCompCode")?.getValue() || "").toLowerCase();

            var dCreatedDate = this.byId("auditCreatedDate")?.getDateValue();
            var dReleaseDate = this.byId("auditReleaseDate")?.getDateValue();

            var aFiltered = aBaseData.filter(function (oItem) {
                var bMatch = true;

                if (sBatchNo && !(oItem.batchNo || "").toLowerCase().includes(sBatchNo)) bMatch = false;
                if (sCreatedBy && !(oItem.createdBy || "").toLowerCase().includes(sCreatedBy)) bMatch = false;
                if (sModifiedBy && !(oItem.modifiedBy || "").toLowerCase().includes(sModifiedBy)) bMatch = false;
                if (sCompCode && !(oItem.compCode || "").toLowerCase().includes(sCompCode)) bMatch = false;

                if (dCreatedDate) {
                    var dVal = that._parseDate(oItem.createdDate || oItem.createdAt);
                    if (!dVal || dVal.toDateString() !== dCreatedDate.toDateString()) bMatch = false;
                }
                if (dReleaseDate) {
                    var dVal2 = that._parseDate(oItem.releaseDate);
                    if (!dVal2 || dVal2.toDateString() !== dReleaseDate.toDateString()) bMatch = false;
                }

                // dynamic filters
                Object.keys(that._auditDynamicFilters || {}).forEach(function (sField) {
                    var oCtrl = that._auditDynamicFilters[sField];
                    if (oCtrl instanceof sap.m.DatePicker) {
                        var dVal = oCtrl.getDateValue();
                        if (dVal) {
                            var dField = that._parseDate(oItem[sField]);
                            if (!dField || dField.toDateString() !== dVal.toDateString()) bMatch = false;
                        }
                    } else if (oCtrl instanceof sap.m.Input) {
                        var sVal = (oCtrl.getValue() || "").toLowerCase();
                        if (sVal && !(oItem[sField] || "").toLowerCase().includes(sVal)) bMatch = false;
                    }
                });

                return bMatch;
            });

            this._createTable("audit", aFiltered);
        },

        onAuditFilterReset: function () {
            ["BatchNo", "CreatedBy", "ModifiedBy", "CompCode"].forEach(k => {
                var oInput = this.byId("audit" + k);
                if (oInput) oInput.setValue("");
            });

            ["CreatedDate", "ReleaseDate"].forEach(k => {
                var oDP = this.byId("audit" + k);
                if (oDP) oDP.setDateValue(null);
            });

            var oFilterRows = this.byId("auditFilterRows");
            oFilterRows.destroyItems();
            this._auditDynamicFilters = {};

            this._createTable("audit", this.getView().getModel().getData().audit);
        },

        // helper
        _parseDate: function (sValue) {
            if (!sValue) return null;
            if (sValue instanceof Date) return new Date(sValue.getFullYear(), sValue.getMonth(), sValue.getDate());
            var d = new Date(sValue);
            return isNaN(d) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
        },

        // ---------------- ACTIVITY FILTERS ----------------
        onActivityFilter: function () {
            var oModel = this.getView().getModel();
            var aBaseData = (this._filteredData && this._filteredData.activity)
                ? this._filteredData.activity
                : (oModel.getData().activity || []);

            var sPkgSite = this.byId("activityPkgSite").getValue().toLowerCase();
            var sCreatedBy = this.byId("activityCreatedBy").getValue().toLowerCase();
            var dLastActivityDate = this.byId("activityLastActivityDate").getDateValue();
            var dTodayDate = this.byId("activityTodayDate").getDateValue();
            var iDaysFromToday = this.byId("activityDaysFromToday").getValue();

            var that = this;

            var aFiltered = aBaseData.filter(function (oItem) {
                var bMatch = true;

                if (sPkgSite && !(oItem.pkgSite || "").toLowerCase().includes(sPkgSite)) bMatch = false;
                if (sCreatedBy && !(oItem.createdBy || "").toLowerCase().includes(sCreatedBy)) bMatch = false;

                if (dLastActivityDate) {
                    var dValue = that._parseDate(oItem.lastActivityDate);
                    if (!dValue || dValue.toDateString() !== dLastActivityDate.toDateString()) {
                        bMatch = false;
                    }
                }

                if (dTodayDate) {
                    var dVal = that._parseDate(oItem.todayDate);
                    if (!dVal || dVal.toDateString() !== dTodayDate.toDateString()) {
                        bMatch = false;
                    }
                }

                if (iDaysFromToday) {
                    var iVal = parseInt(iDaysFromToday, 10);
                    if (!isNaN(iVal) && oItem.daysFromToday !== iVal) {
                        bMatch = false;
                    }
                }

                return bMatch;
            });

            this._createTable("activity", aFiltered);
        },

        onActivityFilterReset: function () {
            this.byId("activityPkgSite").setValue("");
            this.byId("activityCreatedBy").setValue("");
            this.byId("activityLastActivityDate").setDateValue(null);
            this.byId("activityTodayDate").setDateValue(null);
            this.byId("activityDaysFromToday").setValue("");

            this._createTable("activity", this._filteredData.activity || []);
        },

        _parseDate: function (sValue) {
            if (!sValue) return null;
            if (sValue instanceof Date) return sValue;

            if (typeof sValue === "string") {
                var parts = sValue.split("-");
                if (parts.length === 3) {
                    return new Date(parts[0], parts[1] - 1, parts[2]);
                }
            }
            return new Date(sValue);
        }

    });
});
