(function () {

    'use strict';

    var gridHeight = '';
    var gridWidth = '';

    function processIds(self, ids) {
        var actualIds = [];
        if (ids && ids.length > 0) {
            ids.forEach(function (rowId) {
                var rowObject = $(self).getRowData(rowId);
                if (rowObject)
                    actualIds.push(rowObject._id);
            });
        }
        var scp = $(self).scope();
        scp.selected.gridSelectedRows = actualIds;
        //if (!scp.$$phase)
        //    scp.$apply();
    };

   
    app.directive('gridManageAccount', ['$cookies', '$compile', function ($cookies, $compile) {
        return {
            restrict: 'E',
            scope: {
                config: '=',
            },
            link: function (scope, element, attrs) {
                var table;
                var pager;
                var id = attrs.idElm;
                scope.$watch('config', function (newValue) {
                    if (newValue) {
                        $('#' + id).remove();
                        element.children().empty();
                        table = angular.element('<table id="' + id + '"></table>');
                        element.append(table);
                        newValue.viewrecords = true;
                        newValue.altRows = true;
                        newValue.shrinkToFit = false;
                        newValue.autowidth= true,
                     
                        newValue.onSelectAll = function (ids, status) {
                            if(status == true){
                                $(this).scope().selected.gridSelectedRows = ids;
                            } else {
                                $(this).scope().selected.gridSelectedRows = [];
                            }
                           
                         //   $(this).scope().onSelectAllManageAccount($(this).scope(), status, actualIDs);
                        };

                        newValue.onSelectRow = function (row, status, elem) {
                            var ids = $(this).jqGrid('getGridParam', 'selarrrow');
                            processIds(this, ids);
                           // $(this).scope().onSelectRowManageAccout($(this).scope(), status, $(this).getRowData(row)._id);
                        };

                        newValue.onCellSelect = function (rowid, iCol, cellcontent, e) {
                            if (iCol == 3) {
                                $(this).scope().onLastImportedTimeUpdate($(this).getRowData(rowid)._id);
                            }
                            if (iCol == 5) {
                               // $(this).scope().googleLogin();
                                $(this).scope().OnDisconnectButtonCloseManageAccountDailog($(this).getRowData(rowid).last_sync_status);
                            }
                            if (iCol == 6) {
                                var tempArray = [];
                                tempArray.push($(this).getRowData(rowid)._id);
                                $(this).scope().syncDeleteAccountGoogleSync(tempArray);
                            }
                        };

                        newValue.loadComplete = function () {
                            
                            var ids = $(this).jqGrid('getGridParam', 'selarrrow');
                            processIds(this, ids);
                            $('select[id^="sync_"]').each(function () {
                                var previous = '';
                                $(this).on('click', function () {
                                    // Store the current value on focus and on change
                                    previous = $(this).val();
                                }).change(function (val) {
                                    var id = "",timeValue = 0;
                                    $('select[id^="sync_"] option:selected').each(function () {
                                        timeValue += $(this).val();
                                        id = $(this)[0].parentNode.id;
                                        id = id.replace('sync_', '');
                                    });
                                    $(this).scope().syncTimeUpdate(id, timeValue);
                                });
                            });

                            $(".account-disconnected-info-circle-base").hover(function (e) {
                                    $(this).tooltipster({ side: 'right', theme: 'tooltipster-shadow', animationDuration: 0 });
                                    $(this).tooltipster('open').tooltipster('content', $('<lable>Failed to connect</lable><p>A previous attempt to connect </p><p></p><p>to your google account was unsucessful.</p><p> Click on the reconnect button </p><p> to login to your Google account.</p>'));
                                },
                               function () {

                               });
                        };

                        $(table).jqGrid(newValue);
                    }
                });
            }
        };
    }]);

})();