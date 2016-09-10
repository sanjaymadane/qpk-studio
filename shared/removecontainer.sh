#!/bin/sh
container_path=$(/sbin/getcfg container-station Install_Path -f /etc/config/qpkg.conf)
export PATH=$container_path/bin:$container_path/sbin:$PATH

QPKG_PATH=/mnt/ext/opt/qpk
info=$(cat < $QPKG_PATH/container_ver.conf)

NODE_NAME=$(echo $info | awk {'print $1'} | awk -F '=' {'print $2'})
NODE_VERSION=$(echo $info | awk {'print $2'} | awk -F '=' {'print $2'})

MONGO_CONTAINER=$(echo $info | awk {'print $3'} | awk -F '=' {'print $2'})
SERVER1_CONTAINER=$(echo $info | awk {'print $4'} | awk -F '=' {'print $2'})

check_container_name() {
    name=$1
    imgname=$2
    ver=$3
    echo $imgname >> /tmp/qpk.log
    echo $ver >> /tmp/qpk.log
    docker ps -a | grep $name
    RET=$?
    if test "$RET" = "0"
    then
        CONTAINER_ID=$(docker ps -a | grep $name | awk '{print $1}')
        echo "$name Container exist, remove it. $CONTAINER_ID" >> /tmp/qpk.log
        docker stop $CONTAINER_ID
        docker rm -f $CONTAINER_ID
    else
        echo "enter not matching">> /tmp/qpk.log
    fi
    docker images | grep $imgname | awk '{print $3}' | xargs docker rmi
}

check_container_name $SERVER1_CONTAINER $NODE_NAME $NODE_VERSION
check_container_name $MONGO_CONTAINER $NODE_NAME $NODE_VERSION