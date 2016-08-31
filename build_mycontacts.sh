str_timestamp=$(date +%Y%m%d)
app_version="0.9.0"
amd_info=$(cat < ./shared/container_ver.conf)

AMD_NODE_NAME=$(echo $amd_info | awk {'print $1'} | awk -F '=' {'print $2'})
AMD_NODE_VERSION=$(echo $amd_info | awk {'print $2'} | awk -F '=' {'print $2'})

mkdir -p build/${str_timestamp}

#Online installation build process
qbuild
cp  build/qpk_${app_version}.qpkg build/${str_timestamp}/qpk_${app_version}.${str_timestamp}.x86.qpkg