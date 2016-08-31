(function () {
    'use strict';

    app.controller('importFileCtrl', ['$scope', 'ngDialog', 'toasty', '$filter', 'Upload', 'Contact','$http','Preview', '$rootScope', 'Sync',
    function ($scope, ngDialog, toasty, $filter, Upload, Contact, $http, Preview, $rootScope, Sync) {

        $scope.setActiveTab = {};
        $scope.selectedCsvMapping = {};
        $scope.userDefinedTemplate = {};
        $scope.chooseMappingCSV = [];
        $scope.delimiterCSV = [];
        $scope.loadingFile = true;
        $scope.loading = true;
        $scope.uploadFileStoreTemp;
        $scope.uploadFileAndProceedToPreview;
        $scope.importCSVFile;
        $scope.mapping = {};
        $scope.mapping.selectedDelimiter = null;
        $scope.mapping.groupName = null;
        $scope.finishtab = {};
        $scope.finishtab.isAutoImportContact = true;
        $scope.openSaveTemplateDailogue;
        $scope.saveUserDefinedMappingTemplate;
        $scope.selectedCsvMappingChanged;
        $scope.openColumnMapping;
        $scope.configForDynamicGrid = {};
        $scope.dataToBindGrid = {};
        $scope.dataToBindGrid.data = [];
        $scope.filedMappingData = {};
        $scope.filedMappingData.columnNames = [];
        $scope.filedMappingData.dbColumnNames = [];
        $scope.mapperForServerSidePost = {};
        $scope.startImport;
        $scope.pagelimit = {};
        $scope.pagelimit.numberOfRecords = "25";
        $scope.pageNumber = 0;
        $scope.prevPage;
        $scope.nextPage;
        $scope.firstPage;
        $scope.lastPage;
        $scope.pages = 0;
        $scope.page = 0;
        $scope.total = 0;
        $scope.gridCreated = false;
        $scope.firstRow = {};
        $scope.firstRow.importFirstRow = false;
        $scope.fileuploadingProgressing = true;
        $scope.percentageupload = 0;
        $scope.isVcardFile = false;
        $scope.gotopreviouspage;
        
        var templateSaveDialog;
        var uploadingFileTransactionID;
        var setActiveInactive = {};
        setActiveInactive.ActiveContact_id = [];
        setActiveInactive.InactiveContact_id = [];
        setActiveInactive.is_active = true;
        $scope.chooseMappingCSVFromDB = [];
       
        $scope.setActiveTab = {
            tab1: true,
            tab2: false,
            tab3: false,
            tab4: false
        };

        $scope.userDefinedTemplate.template_name = null;
        $scope.userDefinedTemplate.delimiter = null;
        $scope.userDefinedTemplate.mapper = [];
        $scope.importOnFinish;

        $scope.selectedCsvMappingChanged = function (newSelectedMapping) {
            if (newSelectedMapping) {
                $scope.$evalAsync(function () {
                    $scope.mapping.selectedDelimiter = newSelectedMapping.delimiter;
                });
                setAutoColumns(newSelectedMapping);
            }
        };

        function setAutoColumns(newSelectedMapping) {

            angular.forEach($scope.chooseMappingCSVFromDB, function (value, key) {
                if (value.template_name == newSelectedMapping.template_name) {
                    angular.forEach(value.mapper, function (mapvalue, mapkey) {
                        angular.forEach($scope.filedMappingData.columnNames, function (displayValue, displayKey) {
                            var tempDefaultObj = {};
                            tempDefaultObj.name = "Save to Comment";
                            tempDefaultObj.value = "";
                            displayValue.value = tempDefaultObj;
                        });
                    });
                }
            });

            angular.forEach($scope.chooseMappingCSVFromDB, function (value, key) {
                if (value.template_name == newSelectedMapping.template_name) {
                    angular.forEach(value.mapper, function (mapvalue, mapkey) {
                        angular.forEach($scope.filedMappingData.columnNames, function (displayValue, displayKey) {
                            if (displayValue.name == mapvalue.map_name) {
                                var selectedValue = {};
                                selectedValue.name = mapvalue.display_name;
                                selectedValue.value = mapvalue.field_value;
                                displayValue.value = selectedValue;
                            }
                        });
                    });
                }
            });
        }
        
        $scope.openSaveTemplateDailogue = function () {
            $scope.userDefinedTemplate = {
                template_name: null, delimiter: $scope.mapping.selectedDelimiter
            };
            templateSaveDialog = ngDialog.open({
                template: 'views/partials/import-save-template.html',
                scope: $scope,
                closeByDocument: false,
                className: 'ngdialog-theme-default custom-width-360'
            });
        };

        $scope.saveUserDefinedMappingTemplate = function () {
            $scope.mapping.selectedDelimiter = $scope.userDefinedTemplate.delimiter;
            $scope.userDefinedTemplate.mapper = [];
            
            angular.forEach($scope.filedMappingData.columnNames, function (value, key) {
                var tempObj = {};
                tempObj.display_name = value.value.name;
                tempObj.map_name = value.name;
                tempObj.field_value = value.value.value;
                $scope.userDefinedTemplate.mapper.push(tempObj);
            });

            //var url = "http://172.17.28.89:9090/api/v1/imports/template";
            var url = "imports/template";
            Contact.saveUserDefinedColumnMappingIntoDB(url, $scope.userDefinedTemplate, function (res, err) {
                if (res.status) {
                    toasty.error({
                        msg: "Template Saved"
                    });
                    return;
                }
            });
            templateSaveDialog.close();
        };

        $scope.openNASFileChooser = function (type, multiselect, folderSelect) {
            var type = (type != undefined) ? type : null;
            var multiselect = (multiselect != undefined) ? multiselect : true;
            var folderSelect = (folderSelect != undefined) ? folderSelect : false;

            ngDialog.open({
                template: 'views/partials/nas-file-chooser.html',
                controller: 'FileBrowserCtrl',
                className: 'ngdialog-theme-default custom-width-900',
                closeByDocument: false,
                data: {type: type, multiselect: multiselect, folderSelect: folderSelect}
            });
        };

        $rootScope.$on('selectedNASFile', function (event, data) {
            $scope.selectedFile = data[0].path+'/'+data[0].name;

            Sync.uploadFromNAS(data, 'import', function (response, err) {
                if (response.data.status) {
                    $scope.selectedNASFileToImport = response.data.data.file_details[0].path;
                } else {
                    toasty.error({
                        msg: response.data.message
                    });
                }
            });
        });

        $scope.startImport = function () {
            $scope.mapperForServerSidePost.mapper = {};
            $scope.mapperForServerSidePost.delimiter = $scope.mapping.selectedDelimiter;
            $scope.mapperForServerSidePost.group_name = $scope.mapping.groupName;
            $scope.mapperForServerSidePost.import_first_row = $scope.firstRow.importFirstRow;

            angular.forEach($scope.filedMappingData.columnNames, function (value, key) {
                if (value.value == null) {
                    $scope.mapperForServerSidePost.mapper[value.name] = "";
                } else if (value.value.name != "Ignore") {
                    $scope.mapperForServerSidePost.mapper[value.name] = value.value.value;
                }
                // $scope.mapperForServerSidePost.mapper[value.name] = value.value == null? "": value.value.value;
            });

            $scope.setActiveTab.tab4 = true;
            $scope.mapperForServerSidePost.is_direct_import = $scope.finishtab.isAutoImportContact;
            var startImportURL = "contacts/tmp/" + uploadingFileTransactionID + "/import";
            Contact.startImportingContacts(startImportURL, $scope.mapperForServerSidePost, function (res, err) {
                if (res.status) {
                    ngDialog.close();
                    //toasty.error({
                    //    msg: "Preview is ready"
                    //});
                    //return;
                }
            });
        };

        $scope.uploadFileStoreTemp = function (attachmentFile, errorFile) {
            if (errorFile) {
                toasty.error({
                    msg: errorFile.name + ' \n \n ' + $filter('translate')('FILE_VALIDATION') + ' \n \n ' + errorFile.$errorParam
                });
                return;
            }
            if (attachmentFile) {
                $scope.importCSVFile = attachmentFile;
                if (attachmentFile.type == "text/x-vcard" || attachmentFile.type == "text/vcard") {
                    $scope.isVcardFile = true;
                } else {
                    $scope.isVcardFile = false;
                }
            }
        };

        $scope.prevPage = function () {
            setActiveInactiveRecordStatus();
            if ($scope.pageNumber > 0) {
                $scope.pageNumber = $scope.pageNumber - 1;
                var pagenum = $scope.page + 1;
                $scope.paginationDetails = pagenum + '/' + $scope.pages;
                getLoadedRecords();
            }
        };

        $scope.nextPage = function () {
            setActiveInactiveRecordStatus();
            if ($scope.pageNumber < $scope.pages -1) {
                $scope.pageNumber = $scope.pageNumber + 1;
                var pagenum = $scope.page + 1;
                $scope.paginationDetails = pagenum + '/' + $scope.pages;
                getLoadedRecords();
            }
        };

        $scope.firstPage = function () {
            setActiveInactiveRecordStatus();
            $scope.pageNumber = 0;
            $scope.paginationDetails = 1 + '/' + $scope.pages;
            getLoadedRecords();
        };

        $scope.lastPage = function () {
            setActiveInactiveRecordStatus();
            $scope.pageNumber = $scope.pages - 1;
            $scope.paginationDetails = $scope.pages + '/' + $scope.pages;
            getLoadedRecords();
        };

        $scope.gotoGroupNamePage = function () {
            $scope.setActiveTab.tab3 = true;
            setActiveInactiveRecordStatus();
        };

        $scope.gotopreviouspage = function () {
            if ($scope.isVcardFile == true) {
                $scope.setActiveTab.tab1 = true;
            } else {
                $scope.setActiveTab.tab2 = true;
            }
        };

        $scope.uploadFileAndProceedToPreview = function (import_type) {
            $scope.fileuploadingProgressing = true;
            $scope.percentageupload = 0;
            $scope.setActiveTab.tab2 = true;
            $scope.loadingFile = true;
            $scope.gridCreated = false;
            
            if (!import_type) {
                Sync.sendForImport($scope.selectedNASFileToImport, function (response, err) {
                    if (response.data.status) {
                        uploadingFileTransactionID = response.data.data.transaction_id;
                        $scope.mapping.groupName = response.data.data.group_name;

                        $scope.percentageupload = 100;
                        $scope.fileuploadingProgressing = false;

                        if (!$scope.setActiveTab.tab2) {
                            return;
                        }
                        if ($scope.isVcardFile == true) {
                            $scope.setActiveTab.tab3 = true;
                        } else {
                            getLoadedRecords();
                        }
                    } else {
                        $scope.setActiveTab.tab1 = true;
                        toasty.error({
                            msg: response.data.message
                        });
                    }
                });
            } else {
                Upload.upload({
                    url: config.API_URL + "imports",
                    data: { import: $scope.importCSVFile }
                }).then(function (response, err) {
                    if (response.data.status) {
                        uploadingFileTransactionID = response.data.data.transaction_id;
                        $scope.mapping.groupName = response.data.data.group_name;
                    } else {
                        toasty.error({
                            msg: response.data.message
                        });
                        $scope.setActiveTab.tab1 = true;
                    }
                }, function(resp) {
                    // handle error
                }, function (evt) {
                    var percent = parseInt(100.0 * evt.loaded / evt.total);
                    $scope.percentageupload = percent;
                    console.log('progress: ' + percent + '% file :' + evt.config.data.import.name);
                    if (percent == 100) {
                        $scope.fileuploadingProgressing = false;
                    }
                }).then(function (data) {
                    if (!$scope.setActiveTab.tab2) {
                        return;
                    }
                    if ($scope.isVcardFile == true) {
                        $scope.setActiveTab.tab3 = true;
                    } else {
                        getLoadedRecords();
                    }
                }).catch(function (resp, error) {
                    $scope.setActiveTab.tab1 = true;
                    toasty.error({
                        msg: 'api not working'
                    });
                });
            }
        };

        $scope.$watch('pagelimit.numberOfRecords', function (value) {
            if (uploadingFileTransactionID) {
                getLoadedRecords();
            }
           
        });

        function getLoadedRecords() {
            $(".loading").css("display", "block");
            var fetchContactsURL = "contacts/tmp/" + uploadingFileTransactionID + "?" + 'limit=' + $scope.pagelimit.numberOfRecords + '&page=' + $scope.pageNumber;
            Contact.fetchImportedContacts(fetchContactsURL, function (response, error) {
               
                if (response.data.status) {
                    buildGridColumnsAndAssignData(response.data.data, fetchContactsURL);
                    $(".loading").css("display", "none");
                } else {
                    toasty.error({
                        msg: response.data.message
                    });
                    $scope.setActiveTab.tab1 = true;
                    $(".loading").css("display", "none");
                }
            });
        };
        
        $scope.onSelectRow = function (scope, status, id) {

            if (status) {
                if (setActiveInactive.InactiveContact_id) {
                    var index = setActiveInactive.InactiveContact_id.indexOf(id);
                    setActiveInactive.InactiveContact_id.splice(index, 1);
                }

                if (!setActiveInactive.ActiveContact_id) {
                    setActiveInactive.ActiveContact_id = [];
                }
                setActiveInactive.ActiveContact_id.push(id);
            } else {
                if (setActiveInactive.ActiveContact_id) {
                    var index = setActiveInactive.ActiveContact_id.indexOf(id);
                    setActiveInactive.ActiveContact_id.splice(index, 1);
                }

                if (!setActiveInactive.InactiveContact_id) {
                    setActiveInactive.InactiveContact_id = [];
                }
                setActiveInactive.InactiveContact_id.push(id);
            }
        };

        $scope.onSelectAll = function (scope, status, ids) {
            if (status) {
                setActiveInactive.InactiveContact_id = [];
                setActiveInactive.ActiveContact_id = ids;
            } else {
                setActiveInactive.ActiveContact_id = [];
                setActiveInactive.InactiveContact_id = ids;
            }
        };

        function setActiveInactiveRecordStatus() {
            var url = "contacts/tmp/" + uploadingFileTransactionID;

            var setActiveInactiveRecords = {};
            setActiveInactiveRecords.contact_id = [];
            setActiveInactiveRecords.is_active = true;
            if (setActiveInactive.ActiveContact_id && setActiveInactive.ActiveContact_id.length > 0) {
                setActiveInactiveRecords.contact_id = setActiveInactive.ActiveContact_id;
                setActiveInactiveRecords.is_active = true;
                Contact.setActiveInactiveStatus(url, setActiveInactiveRecords, function (resp, error) {
                    setActiveInactive = {};
                    setActiveInactive.ActiveContact_id = [];
                    setActiveInactive.is_active = true;
                });
            }

            if (setActiveInactive.InactiveContact_id && setActiveInactive.InactiveContact_id.length > 0) {
                setActiveInactiveRecords.contact_id = setActiveInactive.InactiveContact_id;
                setActiveInactiveRecords.is_active = false;
                Contact.setActiveInactiveStatus(url, setActiveInactiveRecords, function (resp, error) {
                    setActiveInactive = {};
                    setActiveInactive.InactiveContact_id = [];
                    setActiveInactive.is_active = false;
                });
            }

        }

        function loadColumnMapping() {
            var url = "imports/template";
            Contact.generalGet(url, function (response, err) {
                $scope.chooseMappingCSVFromDB = response.data.data;
                $scope.selectedCsvMapping = $scope.chooseMappingCSVFromDB[0];
                angular.forEach(response.data.data, function (value, key) {
                    if (value.is_default == true) {
                        $scope.filedMappingData.dbColumnNames = value.mapper;
                    }
                })
            });
        };

        function buildGridColumnsAndAssignData(dataToBindGrid, fetchContactsURL) {
            $scope.loadingFile = true;
            $scope.pages = dataToBindGrid.pages;
            $scope.page = dataToBindGrid.page;
            $scope.total = dataToBindGrid.total;


            $scope.paginationDetailsMerge = $scope.page + 1 + "/" + $scope.pages;
           
            var tocount = ($scope.page + 1) * $scope.pagelimit.numberOfRecords;
            var fromcount = $scope.page == 0 ? 1 : tocount - $scope.pagelimit.numberOfRecords;
            tocount = tocount > $scope.total ? $scope.total : tocount;

            $scope.paginationDisplayItemMerge = fromcount + " - " + tocount;


            if ($scope.pages == $scope.page) {
                var pagenum = $scope.page;
            } else {
                var pagenum = $scope.page + 1;
            }
            
            $scope.paginationDetails = pagenum + '/' + $scope.pages;

            if (!$scope.gridCreated) {
                $scope.gridCreated = true;
                var columnName = [];
                var columnModel = [];
                var modelObj = {};
                var colForColumnMapping = [];
                var objForColMapping = {};

                modelObj.name = "_id";
                modelObj.index = "_id";
                modelObj.hidden = true;
                columnModel.push(modelObj);
                                
                columnName.push('');

                angular.forEach(dataToBindGrid.data[0].tmp_data, function (value, key) {
                    modelObj = {};
                    objForColMapping = {};
                    columnName.push(value.label);
                    modelObj.name = value.label;
                    modelObj.width = 150;
                    modelObj.sortable = false;
                    modelObj.fixed = true;
                    modelObj.index = value.label;
                    columnModel.push(modelObj);

                    objForColMapping.name = value.label;
                    objForColMapping.value = "";
                    colForColumnMapping.push(objForColMapping);
                });
                $scope.filedMappingData.columnNames = colForColumnMapping;
                $scope.configForDynamicGrid = {
                    ajaxGridOptions: { contentType: "application/json", cache: false },
                    id: '_id',
                    datatype: 'local',
                    height: 236,
                    width: 750,
                    colNames: columnName,
                    colModel: columnModel,
                    scope: $scope,
                    multiselect: true,
                };
            }
            var tempGridData = [];
            angular.forEach(dataToBindGrid.data, function (value, key) {
                var dataRowObj = {};
                angular.forEach(value.tmp_data, function (valuePair, key) {
                    dataRowObj[valuePair.label] = valuePair.value;
                });
                dataRowObj['_id'] = value._id;
                dataRowObj['is_active'] = value.is_active;
                tempGridData.push(dataRowObj);
            });

            if ($scope.chooseMappingCSVFromDB.length == 0) {
                var url = "imports/template";
                Contact.generalGet(url, function (response, err) {
                    $scope.chooseMappingCSVFromDB = response.data.data;
                    $scope.selectedCsvMapping = $scope.chooseMappingCSVFromDB[0];
                    angular.forEach(response.data.data, function (value, key) {
                        if (value.is_default == true) {
                            $scope.filedMappingData.dbColumnNames = value.mapper;
                        }
                    })

                    //when mapper not present - import first row
                    angular.forEach($scope.chooseMappingCSVFromDB[0].mapper, function (mapvalue, mapkey) {
                        angular.forEach($scope.filedMappingData.columnNames, function (displayValue, displayKey) {
                            var selectedValue = {};
                            selectedValue.name = "Save to Comment";
                            selectedValue.value = "";
                            displayValue.value = selectedValue;
                        });
                    });

                    angular.forEach($scope.chooseMappingCSVFromDB[0].mapper, function (mapvalue, mapkey) {
                        angular.forEach($scope.filedMappingData.columnNames, function (displayValue, displayKey) {
                           if (displayValue.name == mapvalue.map_name) {
                                var selectedValue = {};
                                selectedValue.name = mapvalue.display_name;
                                selectedValue.value = mapvalue.field_value;
                                displayValue.value = selectedValue;
                            }
                        });
                    });
                });
            } else {
                //when mapper not present - import first row
                angular.forEach($scope.chooseMappingCSVFromDB[0].mapper, function (mapvalue, mapkey) {
                    angular.forEach($scope.filedMappingData.columnNames, function (displayValue, displayKey) {
                        var selectedValue = {};
                        selectedValue.name = "Save to Comment";
                        selectedValue.value = "";
                        displayValue.value = selectedValue;
                    });
                });

                angular.forEach($scope.chooseMappingCSVFromDB[0].mapper, function (mapvalue, mapkey) {
                    angular.forEach($scope.filedMappingData.columnNames, function (displayValue, displayKey) {
                        if (displayValue.name == mapvalue.map_name) {
                            var selectedValue = {};
                            selectedValue.name = mapvalue.display_name;
                            selectedValue.value = mapvalue.field_value;
                            displayValue.value = selectedValue;
                        }
                    });
                });
            }
            $scope.dataToBindGrid.data = tempGridData;
            $scope.loadingFile = false;
        };

        $scope.importOnFinish = function () {
            if ($scope.finishtab.isAutoImportContact == true) {
                Preview.import(uploadingFileTransactionID, function (response, err) {
                    ngDialog.close();
                });
            } else {
                ngDialog.close();
            }
        };
    }]);
})();
