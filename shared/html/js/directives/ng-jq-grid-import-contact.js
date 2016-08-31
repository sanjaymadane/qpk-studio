(function () {

    function processIds(self, ids) {
        var actualIds = [];
        if (ids && ids.length > 0) {
            ids.forEach(function (rowId) {
                var rowObject = $(self).getRowData(rowId);
                if (rowObject)
                    actualIds.push(rowObject._id);
            });
        }
        return actualIds;
    };


    app.directive('ngJqGridImportContact', function ($compile) {
        return {
            restrict: 'E',
            scope: {
                config: '=',
                data: '=',
                columnmodelruntime: '=',
                mycontactdbcolumns: '=',
            },
            link: function (scope, element, attrs) {
                var table;
                var id = attrs.id;

                scope.$watch('config', function (newValue) {
                    element.children().empty();
                    table = angular.element('<table id="tableid"></table>');
                   
                    element.append(table);
                    newValue.onSelectAll = function (ids, status) {
                        var actualIDs = processIds(this,ids);
                        $(this).scope().onSelectAll($(this).scope(), status, actualIDs);
                    };

                    newValue.onSelectRow = function (row, status, elem) {
                        $(this).scope().onSelectRow($(this).scope(), status, $(this).getRowData(row)._id);
                    };
                
                    $(table).jqGrid(newValue);
                });

                scope.$watch('data', function (newValue, oldValue) {
                    var i;
                    for (i = oldValue.length - 1; i >= 0; i--) {
                        $(table).jqGrid('delRowData', i);
                    }
                    for (i = 0; i < newValue.length; i++) {
                        $(table).jqGrid('addRowData', i, newValue[i]);
                        if (newValue[i].is_active) {
                            $(table).jqGrid('resetSelection', i,true);
                            $(table).jqGrid('setSelection', i, true);
                        } else {
                            $(table).jqGrid('resetSelection', i,false);
                        }
                    }
                });
                scope.$watch('mycontactdbcolumns', function (dbColumnValues) {
                    scope.filedMappingData = {};
                    scope.filedMappingData.myContactDBFields = [];

                    var tempObjIgnore = {};
                    tempObjIgnore.value = "ignore";
                    tempObjIgnore.name = "Ignore";
                    scope.filedMappingData.myContactDBFields.push(tempObjIgnore);

                    angular.forEach(dbColumnValues, function (value, key) {
                        var tempObj = {};
                        tempObj.value = value.field_value;
                        tempObj.name = value.display_name;
                        scope.filedMappingData.myContactDBFields.push(tempObj);
                    });
                   
                });

                scope.$watch('columnmodelruntime', function (ColumnValues) {

                    if (ColumnValues.length < 1 ) {
                        return;
                    }
                    $("#gbox_tableid").remove();
                    var grpHeaders = [];
                    var headerObj = {};
                    if (!scope.filedMappingData) {
                        scope.filedMappingData = {};
                        scope.filedMappingData.myContactDBFields = [];
                    }
                    angular.forEach(ColumnValues, function (value, key) {
                        var ele = '<select ng-model="columnmodelruntime[' + key + '].value" ng-options="mapping.name for mapping in filedMappingData.myContactDBFields track by mapping.value"><option value="">Save to Comment</option></select>';
                        headerObj = {};
                        headerObj.startColumnName = value.name;
                        headerObj.numberOfColumns = 1;
                        headerObj.titleText = $compile(ele)(scope);
                        grpHeaders.push(headerObj);
                    });

                    $("#tableid").jqGrid('setGroupHeaders', {
                        useColSpanStyle: false,
                        groupHeaders: grpHeaders
                    });

                });
            }
        };
    });
})();