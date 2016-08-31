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
    scp.selectedRows = actualIds;
    if (!scp.$$phase)
        scp.$apply();
};

function sendQMail(email, sid) {
    window.open(config.QMAIL_URL+email+'&_sid='+sid, "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=200, left=500, width=700, height=600");
}

app.directive('ngJqGrid', ['$cookies',function ($cookies) {
    return {
        restrict: 'E',
        scope: {
            config: '=',
            userdata: '=',
        },
        link: function (scope, element, attrs) {
            var table;
            var pager;
            var id = attrs.idElm;
            scope.$watch('config', function (newValue) {
                if(newValue){
                    $('#' + id).remove();
                    $('#pager' + id).remove();
                    element.children().empty();
                    table = angular.element('<table id="' + id + '"></table>');
                    
                    element.append(table);
                    newValue.viewrecords = true;
                    newValue.altRows = true;
                    newValue.loadonce = false;
                    newValue.shrinkToFit = false;
                    newValue.autowidth = true;

                    if (id != 'history-grid') {
                        newValue.multiselect = true;
                        newValue.multiboxonly = true;
                       pager = angular.element('<div id="pager' + id + '"></div>');
                        element.append(pager);
                        newValue.pager = '#pager' + id;
                        // newValue.beforeSelectRow = function(rowid, e) {
                        //    return $(e.target).is('input[type=checkbox]');
                        // };
                    } 
                    newValue.onSelectAll = function (ids, status) {
                        var rowIds = [];
                        if (status)
                            rowIds = ids;
                        processIds(this, rowIds);
                    };
                    newValue.onSelectRow = function (row, status, elem,e,r,f) {
                        var params = {};
                        var action = "";
                        if ($(elem.toElement).hasClass('sendQMail')) {
                            action = 'sendQMail';
                        }
                        if ($(elem.toElement).hasClass('delete')) {
                            $("#"+id).resetSelection(row);
                            action = 'delete';
                            params.is_active = $(elem.toElement).hasClass('true') ? false : true;
                        }
                        if ($(elem.toElement).hasClass('private')) {
                            $("#"+id).resetSelection(row);
                            action = 'private';
                            params.is_locked = $(elem.toElement).hasClass('true') ? false : true;
                        }
                        if ($(elem.toElement).hasClass('favorite')) {
                            $("#"+id).resetSelection(row);
                            action = 'favorite';
                            params.is_favorite = $(elem.toElement).hasClass('true') ? false : true;
                        }
                        if ($(elem.toElement).hasClass('edit')) {
                            $("#"+id).resetSelection(row);
                            action = 'edit';
                        }
                        
                        if (action != "") {
                            $(this).scope().onSelectRow($(this).scope(), action, params, $(this).getRowData(row)._id);
                        } else {
                            var ids = $(this).jqGrid('getGridParam', 'selarrrow');
                            processIds(this, ids);
                        }
                        if(!$(elem.target).hasClass('cbox'))
                            $("#"+id).resetSelection(row);
                    };
                    newValue.onPaging = function(pgButton, event){
                        if (pgButton == "user") {
                            // find out the requested and last page
                            var lastPage = $(this).getGridParam("lastpage");
                            
                            // if the requested page is higher than the last page value 
                            if (isNaN(event.value) || event.value > lastPage) {
                                $(this).setGridParam({page:lastPage}).trigger("reloadGrid");
                                return 'stop';
                            }
                          }
                        $(this).scope().updatePaginationConfiguration({pagination: event.value});
                    };
                    newValue.loadComplete = function () {
                        var ids = $(this).jqGrid('getGridParam', 'selarrrow');
                        processIds(this, ids);
                        if (id == 'contact-grid' && $(this).scope()) {
                            $(this).scope().load_groups();
                            $(this).scope().set_groups_menu();
                        }
                                
                        $('select[id^="email_"]').each(function() {
                            var previous = '';
                            $(this).on('click', function () {
                                // Store the current value on focus and on change
                                previous = $(this).val();
                            }).change(function(){
                                $(this).scope().sendQMail($(this), previous);
                            });
                        });

                        $('.ui-jqgrid-bdiv').scrollTop(0);
                        if (id == 'contact-grid' && $(this).scope().menu.trash != "selected") {
                            $("#"+id).jqGrid('hideCol', 'updated_on');
                        }

                        if (id == 'importPreviewGrid') {
                            $("#"+id).jqGrid('hideCol', 'cb');
                        }

                        $(".profile-pic").hover(function(e){
                            $(this).tooltipster({side: 'right', theme: 'tooltipster-shadow', animationDuration: 0});
                            $(this).tooltipster('open').tooltipster('content', $('<img src="'+this.src+'" height="100" width="100" />'));
                        },
                        function(){

                        });
                        if (id=='contact-grid') {
                            $(this).scope().setConfiguration();
                        }
                    };
                    gridHeight = (attrs.gridHeight != undefined) ? attrs.gridHeight : $(window).innerHeight() - 220;
                    if (id == 'history-grid')
                        gridHeight = gridHeight + 45;
                    gridWidth = (attrs.gridWidth != undefined) ? attrs.gridWidth : $(window).innerWidth();

                    $('#' + id).jqGrid(newValue);
                    $('#' + id).jqGrid('navGrid', '#pager' + id, {add: false, edit: false, del: false, search: false, refresh: false},
                            {}, {}, {}, {multipleSearch: true, multipleGroup: true, showQuery: true});
                    $('#' + id).jqGrid('setGridHeight', gridHeight);
                    $('#' + id).jqGrid('setGridWidth', 'auto');
                    $('#' + id).jqGrid('setFrozenColumns');
    //                Below code is for column chooser.
    //                $('#' + id).jqGrid('navButtonAdd', '#pager' + id, {
    //                    caption: "",
    //                    buttonicon: "ui-icon-calculator",
    //                    title: "Choose columns",
    //                    onClickButton: function () {
    //                        $(this).jqGrid('columnChooser',{
    //                            width: 260,
    //                            height: 280,
    //                            classname: "column-chooser",
    //                            msel_opts: { //multiselect options
    //                                autoOpen: true,
    //                                header: true,
    //                                height: "auto",
    //                                classes: "column-chooser",
    //                                beforeclose: function () { return false; } //keep multiselect drop down open  
    //                            }
    //                        });
    //                    }
    //                });
                }
            });
            scope.$watch('userdata', function (userdata, oldvalue) {
                $('#' + id).setGridParam({userdata: userdata}).trigger('reloadGrid');
                $('.ui-jqgrid-bdiv').scrollTop(0);
            });
            $(window).resize(function () {
                if (id != 'importPreviewGrid') {
                    gridHeight = (attrs.gridHeight != undefined) ? attrs.gridHeight : $(window).innerHeight() - 220;
                    gridWidth = (attrs.gridWidth != undefined) ? attrs.gridWidth : $(window).innerWidth() - 275;
                    if(id == 'history-grid')
                        gridHeight = gridHeight + 20;
                    $('#' + id).jqGrid('setGridHeight', gridHeight);
                    $('#' + id).jqGrid('setGridWidth', gridWidth);
                }
            });
        }
    };
}]);