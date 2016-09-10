#!/bin/sh

QPKG_PATH=/mnt/ext/opt/qpk
info=$(cat < $QPKG_PATH/container_ver.conf)

MONGO_CONTAINER=$(echo $info | awk {'print $3'} | awk -F '=' {'print $2'})
SERVER1_CONTAINER=$(echo $info | awk {'print $4'} | awk -F '=' {'print $2'})

stop_container_name() {
    name=$1
    docker ps -a | grep $name | grep Up >/dev/null
    RET=$?
    if test "$RET" = "0"
    then
        CONTAINER_ID=$(docker ps -a | grep $name | awk '{print $1}')
        echo "$name Container is running, stop it. $CONTAINER_ID $(date +"%Y-%m-%d %T")" >> /tmp/qpk.log
        docker stop -t 3 $CONTAINER_ID
    else
        echo "Stop container $name fail $(date +"%Y-%m-%d %T")" >> /tmp/qpk.log
    fi
}

stop_container_name $SERVER1_CONTAINER
stop_container_name $MONGO_CONTAINER
