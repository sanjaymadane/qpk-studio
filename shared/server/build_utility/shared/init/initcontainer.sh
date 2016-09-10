#!/bin/sh
#QPKG_NAME=

#QPKG_PATH=$(/sbin/getcfg $QPKG_NAME Install_Path -f $CONF)

source $1/app.conf

CONF="/etc/config/qpkg.conf"
CONTAINER_STATION_NAME="container-station"
CONTAINER_STATION_PATH=$(/sbin/getcfg $CONTAINER_STATION_NAME Install_Path -f $CONF)
mountlocaltime=" -v /etc/localtime:/etc/localtime"
SYSTEM_MOUNT=" -v /etc/qbus:/etc/qbus -v $CONTAINER_STATION_PATH/usr/bin/.libs/qbus:/bin/qbus -v /var/run/qbus.sock:/var/run/qbus.sock "

QPKG_PATH=$(/sbin/getcfg $QPKG_NAME Install_Path -f $CONF)
echo $QPKG_PATH
echo "I am inside init container"

create_container() {
  name=$1
  image=$2
  ver=$3
  mkdir -p .cache_qpk
  docker ps -a | grep $name >/dev/null
  RET=$?
  if test "$RET" = "0"
  then
    CONTAINER_ID=$(docker ps -a | grep $name | awk '{print $1}')
    echo "$name Container is stop and remove it. $CONTAINER_ID"
    docker stop $CONTAINER_ID
    docker rm $CONTAINER_ID        
  fi
  
  if test "$name" = "$CONTAINER1"
  then
    docker run -d $mountlocaltime -p $CONTAINER1_PORT:80 -v $QPKG_PATH/html/:/var/www/html/ --ulimit nofile=262144:262144 --name $CONTAINER1 $image:$ver sh run.sh
  fi
}

create_container $CONTAINER1 $IMAGE_NAME $IMAGE_VERSION
