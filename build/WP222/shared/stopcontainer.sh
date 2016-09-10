#!/bin/sh

source $1/app.conf

stop_container_name() {
    name=$1
    docker ps -a | grep $name | grep Up >/dev/null
    RET=$?
    if test "$RET" = "0"
    then
        CONTAINER_ID=$(docker ps -a | grep $name | awk '{print $1}')
        echo "$name Container is running, stop it. $CONTAINER_ID $(date +"%Y-%m-%d %T")" >> /tmp/$QPKG_NAME.log
        docker stop -t 3 $CONTAINER_ID
    else
        echo "Stop container $name fail $(date +"%Y-%m-%d %T")" >> /tmp/$QPKG_NAME.log
    fi
}

stop_container_name $CONTAINER1
