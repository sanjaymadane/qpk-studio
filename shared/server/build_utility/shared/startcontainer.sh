#!/bin/sh
source $1/app.conf

start_container_name() {
  name=$1
  docker ps -a | grep $name | grep Exited >/dev/null
  RET=$?
  if test "$RET" = "0"
  then
    CONTAINER_ID=$(docker ps -a | grep $name | grep Exited | awk '{print $1}')
    echo "$name Container is stop, start it. $CONTAINER_ID"
    docker start $CONTAINER_ID
    echo "start container $name success $(date +"%Y-%m-%d %T")" >> /tmp/$QPKG_NAME.log
  else
    echo "start container $name fail $(date +"%Y-%m-%d %T")" >> /tmp/$QPKG_NAME.log
  fi
}

start_container_name $CONTAINER1