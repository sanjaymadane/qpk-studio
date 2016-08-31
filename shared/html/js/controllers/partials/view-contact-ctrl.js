'use strict';

app.controller('ViewContactCtrl', ['$scope', '$location', 'contact_id', 'Contact', '$cookies', 'Group','$filter', function ($scope, $location, contact_id, Contact, $cookies, Group, $filter) {
    $scope.contact = {};
    Contact.getContact(contact_id, function(response, err){
    	$scope.accessToken = $cookies.get('accessToken');
    	if(!err && response.data.status){
    		$scope.contact = response.data.data;
    		$scope.contact.profile_pic = $scope.contact.profile_pic ? config.PIC_URL + $scope.contact.profile_pic : 'resources/img/contact_photo.png';
            if($scope.contact.events && $scope.contact.events.length > 0){
                $scope.contact.events.forEach(function(ev){
                    if(ev.value)
                        ev.value = moment(ev.value).format('DD-MMM-YYYY');
                });
            }
    		if (!$scope.$$phase) $scope.$apply();
    	} else
    		$scope.contact = {};
    });
    $scope.groups = [];
    $scope.contryDialCodes = config.COUNTRY_FLAGS;
    $scope.editContact = function(){
    	$scope.closeThisDialog('success');
    	$location.path('/contacts/edit/' + contact_id);
    };
    $scope.composeQMail = function (email) {
        var user = ($cookies.get('user')) ? JSON.parse($cookies.get('user')) : {};
        window.open(config.QMAIL_URL + email + '&_sid=' + user.sid, "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=200, left=500, width=700, height=600");
    };
    function getCSSClassOnCountryCode(phones) {
        $scope.countryFlagCss = $scope.countryDialCodeWithCSSClass[phones];
        if (!$scope.countryFlagCss)
            $scope.countryFlagCss = "flag";
    }
    $scope.load_groups = function(){
        Group.getGroups('', function (response) {
            if (response.data.status) {
                $scope.groups = response.data.data.data;
            } else {
                $scope.groups = [];
            }
            $scope.getGroupStatus();
        });
    };

    $scope.getGroupStatus = function () {        
        Group.getBatchGroupStatus({ contact_ids: [contact_id] }, function (response, err) {
            var is_group_selected = false;
            if(response.data.status){
                response.data.data.forEach(function (group) {
                    if(group.status == 'all'){
                        is_group_selected = true;
                        var foundGroup = $filter('filter')($scope.groups,{_id: group.group_id});
                        if(foundGroup && foundGroup.length > 0)
                            foundGroup[0].selected = true;
                    }
                });
                if (!$scope.$$phase) $scope.$apply();
                if(is_group_selected)
                    $('.group-icon-container > i').removeClass('icon-group').addClass('icon-group-active');
            } else {
                $('.group-icon-container > i').removeClass('icon-group-active').addClass('icon-group');
            }
        });
    };
    $scope.load_groups();
}]);