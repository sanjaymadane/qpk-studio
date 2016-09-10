#!/bin/sh
source $1/app.conf

container_path=$(/sbin/getcfg container-station Install_Path -f /etc/config/qpkg.conf)
export PATH=$container_path/bin:$container_path/sbin:$PATH

check_container_name() {
    name=$1
    imgname=$2
    ver=$3
    echo $imgname >> /tmp/$QPKG_NAME.log
    echo $ver >> /tmp/$QPKG_NAME.log
    docker ps -a | grep $name
    RET=$?
    if test "$RET" = "0"
    then
        CONTAINER_ID=$(docker ps -a | grep $name | awk '{print $1}')
        echo "$name Container exist, remove it. $CONTAINER_ID" >> /tmp/$QPKG_NAME.log
        docker stop $CONTAINER_ID
        docker rm -f $CONTAINER_ID
    else
        echo "enter not matching">> /tmp/$QPKG_NAME.log
    fi

    #docker images | grep $imgname | awk '{print $3}' | xargs docker rmi
}

check_container_name $CONTAINER1 $IMAGE_NAME $IMAGE_VERSION