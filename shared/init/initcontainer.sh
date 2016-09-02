#!/bin/sh


CONF="/etc/config/qpkg.conf"
CONTAINER_STATION_NAME="container-station"
CONTAINER_STATION_PATH=$(/sbin/getcfg $CONTAINER_STATION_NAME Install_Path -f $CONF)
mountlocaltime=" -v /etc/localtime:/etc/localtime"
SYSTEM_MOUNT=" -v /etc/qbus:/etc/qbus -v $CONTAINER_STATION_PATH/usr/bin/.libs/qbus:/bin/qbus -v /var/run/qbus.sock:/var/run/qbus.sock "
QPKG_PATH=/mnt/ext/opt/qpk

info=$(cat < $QPKG_PATH/container_ver.conf)

NODE_NAME=$(echo $info | awk {'print $1'} | awk -F '=' {'print $2'})
NODE_VERSION=$(echo $info | awk {'print $2'} | awk -F '=' {'print $2'})

RABBITMQ_NAME=$(echo $info | awk {'print $3'} | awk -F '=' {'print $2'})
RABBITMQ_VERSION=$(echo $info | awk {'print $4'} | awk -F '=' {'print $2'})

RABBITMQ_CONTAINER=$(echo $info | awk {'print $5'} | awk -F '=' {'print $2'})
MONGO_CONTAINER=$(echo $info | awk {'print $6'} | awk -F '=' {'print $2'})
SERVER1_CONTAINER=$(echo $info | awk {'print $7'} | awk -F '=' {'print $2'})
SERVER2_CONTAINER=$(echo $info | awk {'print $8'} | awk -F '=' {'print $2'})

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
  
  if test "$name" = "$MONGO_CONTAINER"
  then
    docker run -d -e AUTH="no" $mountlocaltime -p 27025:27017 -v $QPKG_PATH/mongodata/:/data/db --name $MONGO_CONTAINER  $image:$ver mongod
  fi
  
  if test "$name" = "$SERVER1_CONTAINER"
  then
    docker run -d $mountlocaltime  -p 9010:9010 -v /share/Public/.cache_qpk:/server/public/nas_cache -v $QPKG_PATH/server/:/server $SYSTEM_MOUNT -v /etc/config/:/app_config --name $SERVER1_CONTAINER --entrypoint /bin/bash $image:$ver /server/start_server.sh
  fi
}

create_container $MONGO_CONTAINER $NODE_NAME $NODE_VERSION
create_container $SERVER1_CONTAINER $NODE_NAME $NODE_VERSION
