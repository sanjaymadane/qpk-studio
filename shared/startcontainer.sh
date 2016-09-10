#!/bin/sh

QPKG_PATH=/mnt/ext/opt/qpk
info=$(cat < $QPKG_PATH/container_ver.conf)

MONGO_CONTAINER=$(echo $info | awk {'print $3'} | awk -F '=' {'print $2'})
SERVER1_CONTAINER=$(echo $info | awk {'print $4'} | awk -F '=' {'print $2'})

start_container_name() {
  name=$1
  docker ps -a | grep $name | grep Exited >/dev/null
  RET=$?
  if test "$RET" = "0"
  then
    CONTAINER_ID=$(docker ps -a | grep $name | grep Exited | awk '{print $1}')
    echo "$name Container is stop, start it. $CONTAINER_ID"
    docker start $CONTAINER_ID
    echo "start container $name success $(date +"%Y-%m-%d %T")" >> /tmp/qpk.log
  else
    echo "start container $name fail $(date +"%Y-%m-%d %T")" >> /tmp/qpk.log
  fi
}

start_container_name $MONGO_CONTAINER
start_container_name $SERVER1_CONTAINER