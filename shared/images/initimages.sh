#!/bin/sh

QPKG_PATH=/mnt/ext/opt/qpk
info=$(cat < $QPKG_PATH/container_ver.conf)

NODE_NAME=$(echo $info | awk {'print $1'} | awk -F '=' {'print $2'})
NODE_VERSION=$(echo $info | awk {'print $2'} | awk -F '=' {'print $2'})

MONGO_CONTAINER=$(echo $info | awk {'print $3'} | awk -F '=' {'print $2'})
SERVER1_CONTAINER=$(echo $info | awk {'print $4'} | awk -F '=' {'print $2'})

create_images() {
    filename=$1
    ver=$2
    newfilename=$(echo $filename | sed "s/\//_/")

    if [ -f $QPKG_PATH/images/"$newfilename".tar ]
    then
        echo "File found processing load...";
        docker load < $QPKG_PATH/images/"$newfilename".tar
    else
        echo "File not found locally, loading from docker hub..."
        docker pull $filename:$ver
    fi
}

check_image_name() {
    name=$1
    ver=$2
    docker images | grep $name > /dev/null
    if [ $? -eq 0 ]; then
        tag=$(docker images | grep $name | grep $ver | awk '{print $2}') >/dev/null
        if test "$tag" = $ver
        then
            echo "Image already loaded => $name:$ver, skipped loading."            
        else 
            docker rmi $name:$tag
            create_images $name $ver
        fi
    else
        create_images $name $ver
    fi
}

check_image_name $RABBITMQ_NAME $RABBITMQ_VERSION
check_image_name $NODE_NAME $NODE_VERSION
