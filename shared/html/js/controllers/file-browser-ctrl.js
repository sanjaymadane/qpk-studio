(function () {
    'use strict';

    app.controller('FileBrowserCtrl', ['$scope', 'ngDialog', 'CGI', '$rootScope', function ($scope, ngDialog, CGI, $rootScope) {
        //Tree control for NAS file chooser - start
        $scope.type = $scope.ngDialogData.type;
        $scope.multiselect = $scope.ngDialogData.multiselect;
        $scope.folderSelect = $scope.ngDialogData.folderSelect;

        $scope.treeOptions = {
            nodeChildren: "children",
            dirSelectable: true,
            isLeaf: function (node) {
                return node.iconCls == 'folder';
            },
            injectClasses: {
                ul: "a1",
                li: "a2",
                liSelected: "a7",
                iExpanded: "a3",
                iCollapsed: "a4",
                iLeaf: "a5",
                label: "a6",
                labelSelected: "a8" 
            }
        };

        $scope.expandedNodes = [];

        $scope.getNASFile = function(filePath){
            $scope.navigatorArray = [];
            $scope.selectedFiles = [];

            CGI.getFoldersStructure($scope.userDetails.sid, filePath, function (response, err) {
                if (response.status == 200) {
                    if (response.data instanceof Array) {
                        $scope.nasDir = [];
                        _.filter(response.data, function(dir){
                            $scope.nasDir.push({id: dir.id, text: dir.text, children: []});
                        });
                    }
                }
                
                $scope.loadSelected($scope.nasDir[0]);
            });
        };

        $scope.navigate = function (action) {
            var node_id = $scope.selectedTreeNode.id;

            _.each($scope.navigatorArray, function (item, i) {
                if (item.id == node_id) {
                    switch (action) {
                        case 'back':
                            if (i > -1) {
                                if ($scope.navigatorArray[i-1]) {
                                    $scope.expandedNodes.splice(i,1);
                                    $scope.loadSelected($scope.navigatorArray[i-1], true);
                                }
                            }
                            break;
                        case 'forward':
                            if (i < $scope.navigatorArray.length) {
                                if ($scope.navigatorArray[i+1]) {
                                    $scope.loadSelected($scope.navigatorArray[i+1], true);
                                }
                            }
                            break;
                    }
                }
            });
        };

        $scope.selectNASFile = function (index, fileDetails, event) {
            if (!fileDetails.isfolder && !$scope.folderSelect) {
                if (event.ctrlKey && $scope.multiselect) {
                    $('#filename_'+index).attr('class', 'success');
                } else {
                    $('tr[id^="filename_"]').removeClass('success');
                    $scope.selectedFiles = [];
                    $('#filename_'+index).attr('class', 'success');
                }
                $scope.selectedFiles.push({path:$scope.selectedTreeNode.id, name:fileDetails.filename});
            } else if (fileDetails.isfolder && $scope.folderSelect) {
                if (event.ctrlKey && $scope.multiselect) {
                    $('#filename_'+index).attr('class', 'success');
                } else {
                    $('tr[id^="filename_"]').removeClass('success');
                    $scope.selectedFiles = [];
                    $('#filename_'+index).attr('class', 'success');
                }
                $scope.selectedFiles.push({path:$scope.selectedTreeNode.id, name:fileDetails.filename});
            }
        };

        $scope.sendSelectedNASFile = function () {
            $rootScope.$emit('selectedNASFile', $scope.selectedFiles);
        };

        $scope.selectNASFolder = function (folderDetails) {
            if (folderDetails.isfolder) {
                _.each($scope.nasDirDetails, function (dir) {
                    if (dir.id == $scope.selectedTreeNode.id+'/'+folderDetails.filename) {
                        $scope.loadExpanded($scope.selectedTreeNode);
                        $scope.loadSelected({id: dir.id, text: dir.text, children: []});
                    }
                });
                $scope.selectedFiles = [];
            }
        };
        
        $scope.loadSelected = function (node, navigate) {
            $scope.loading = true;
            if (!$scope.selectedTreeNode || $scope.selectedTreeNode.id != node.id) {
                if (!navigate) {
                    $scope.navigatorArray.push(node);
                }
                $scope.selectedFiles = [];
                $scope.selectedTreeNode = node;
                CGI.getFilesStructure($scope.userDetails.sid, node.id, $scope.type, function (response, err) {
                    if (response.status == 200) {
                        if (response.data.datas instanceof Array) {
                            $scope.nasFileDetails = response.data.datas;
                            $scope.totalContentSize = 0;
                            _.each($scope.nasFileDetails, function (nasFile) {
                                $scope.totalContentSize = parseInt($scope.totalContentSize) + parseInt(nasFile.filesize);
                            });
                        }
                    }
                });
                CGI.getFoldersStructure($scope.userDetails.sid, node.id, function(response, err){
                    if (response.status == 200) {
                        if (response.data instanceof Array) {
                            $scope.nasDirDetails = response.data;
                        }
                    }
                });
            } else {
                $scope.selectedTreeNode = [];
                $scope.nasFileDetails = [];
                $scope.selectedFiles = [];
            }
            $scope.loading = false;
        };

        $scope.loadExpanded = function(node, expanded) {
            if (expanded) {
                $scope.loading = true;
                $scope.expandedNodes.push(node);
                CGI.getFoldersStructure($scope.userDetails.sid, node.id, function(response, err){
                    if (response.status == 200) {
                        var treeData = [];
                        if (response.data instanceof Array) {
                            $scope.nasDirDetails = response.data;
                            _.filter(response.data, function(dir){
                                treeData.push({id: dir.id, text: dir.text, children: []});
                            });
                            if (treeData.length > 0) {
                                $scope.addSubTree($scope.nasDir, node, treeData);
                            }
                        }
                    }
                    $scope.loading = false;
                });
            } else {
                _.filter($scope.expandedNodes, function(expandedNode, i){
                    if (expandedNode && expandedNode.id.indexOf(node.id) > -1) {
                        $scope.expandedNodes.splice(i);
                    }
                });
            }
        };

        $scope.addSubTree = function (nasDir, node, treeData) {
            $.grep(nasDir, function (dir) {
                if (dir.children.length > 0) {
                    _.each(dir.children, function (item) {
                        if (item.id == node.id) {
                            item.children = treeData;
                        } else {
                            if (item.children.length > 0) {
                                $scope.addSubTree(item.children, node, treeData);
                            }
                        }
                    })
                } else {
                    if (dir.id == node.id) {
                        dir.children = treeData;
                    }
                }
            });
            $scope.nasDir = nasDir;
        };
        //Tree control for NAS file chooser - end
    }]);
})();
        