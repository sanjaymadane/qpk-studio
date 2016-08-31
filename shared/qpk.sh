#!/bin/sh
CONF=/etc/config/qpkg.conf

QPKG_NAME="qpk"

QPK_HOME=$("/sbin/getcfg" "${QPKG_NAME}" "Install_Path" -f "${CONF}")

QPKG_PATH=$(/sbin/getcfg $QPKG_NAME Install_Path -f $CONF)

WEB_SHARE=$(/sbin/getcfg SHARE_DEF defWeb -d Qweb -f /etc/config/def_share.info)

WEB_PATH=$(/sbin/getcfg $WEB_SHARE path -f /etc/config/smb.conf)

QPKG_ROOT=`/sbin/getcfg $QPKG_NAME Install_Path -f ${CONF}`

BIN_PATH="/bin"

SYS_WEB_INIT=/etc/init.d/Qthttpd.sh
APACHE_CONF=/etc/config/apache/apache.conf
PROXY_CONF=/etc/apache-sys-proxy.conf
PROXY_CONF_TPLT=/etc/default_config/apache-sys-proxy.conf.tplt
PROXY_SSL_CONF=/etc/apache-sys-proxy-ssl.conf
PROXY_SSL_CONF_TPLT=/etc/default_config/apache-sys-proxy-ssl.conf.tplt
APACHE_PIDFILE=/var/lock/apache.pid
SYS_CONFIG_DIR=/etc/config
SYS_QPKG_CONFIG=${SYS_CONFIG_DIR}/qpkg.conf
SYS_QPKG_CFG_ENABLE=Enable
CMD_SETCFG=/sbin/setcfg
PS=/bin/ps
GREP=/bin/grep
AWK=/bin/awk
KILL=/bin/kill
APACHE_PATH=/usr/local/apache/bin/apache

#CMD Declaration
CMD_CP="/bin/cp"
CMD_CUT="/bin/cut"
CMD_ECHO="/bin/echo"
CMD_GETCFG="/sbin/getcfg"
CMD_GREP="/bin/grep"
CMD_LN="/bin/ln"
CMD_MKDIR="/bin/mkdir"
CMD_MV="/bin/mv"
CMD_READLINK="/usr/bin/readlink"
CMD_RM="/bin/rm"
CMD_SETCFG="/sbin/setcfg"
CMD_SYNC="/bin/sync"
CMD_TAR="/bin/tar"
CMD_TOUCH="/bin/touch"
CMD_WLOG="/sbin/write_log"
CMD_SED="/bin/sed"
CMD_KILL="/bin/kill"
CMD_SLEEP="/bin/sleep"
CMD_DATE=`/bin/date +"%Y-%m-%d"`


container_path=$(/sbin/getcfg container-station Install_Path -f /etc/config/qpkg.conf)
export PATH=$container_path/bin:$container_path/sbin:$PATH

current_apache_version=$($APACHE_PATH -v | awk  -F: '/Apache/{print $2}' | awk -F 'Apache/' '{print $2}' | awk -F. '{printf("%d.%d.%d", $1,$2,$3)}')

add_apache_cfg() {
  sed -i '/ProxyPreserveHost On/a ProxyPassReverse /qpk http://127.0.0.1/qpk' ${PROXY_CONF}
  sed -i '/ProxyPreserveHost On/a ProxyPassReverse /qpk http://127.0.0.1/qpk' ${PROXY_CONF_TPLT}
  sed -i '/ProxyPreserveHost On/a ProxyPassReverse /qpk http://127.0.0.1/qpk' ${PROXY_SSL_CONF}
  sed -i '/ProxyPreserveHost On/a ProxyPassReverse /qpk http://127.0.0.1/qpk' ${PROXY_SSL_CONF_TPLT}
  sed -i '/ProxyPreserveHost On/a ProxyPass /qpk http://127.0.0.1/qpk retry=0' ${PROXY_CONF}
  sed -i '/ProxyPreserveHost On/a ProxyPass /qpk http://127.0.0.1/qpk retry=0' ${PROXY_CONF_TPLT}
  sed -i '/ProxyPreserveHost On/a ProxyPass /qpk http://127.0.0.1/qpk retry=0' ${PROXY_SSL_CONF}
  sed -i '/ProxyPreserveHost On/a ProxyPass /qpk http://127.0.0.1/qpk retry=0' ${PROXY_SSL_CONF_TPLT}

  sed -i '/ProxyPreserveHost On/a ProxyPassReverse /qpkapi http://127.0.0.1:9010' ${PROXY_CONF}
  sed -i '/ProxyPreserveHost On/a ProxyPassReverse /qpkapi http://127.0.0.1:9010' ${PROXY_CONF_TPLT}
  sed -i '/ProxyPreserveHost On/a ProxyPassReverse /qpkapi http://127.0.0.1:9010' ${PROXY_SSL_CONF}
  sed -i '/ProxyPreserveHost On/a ProxyPassReverse /qpkapi http://127.0.0.1:9010' ${PROXY_SSL_CONF_TPLT}
  sed -i '/ProxyPreserveHost On/a ProxyPass /qpkapi http://127.0.0.1:9010 retry=0' ${PROXY_CONF}
  sed -i '/ProxyPreserveHost On/a ProxyPass /qpkapi http://127.0.0.1:9010 retry=0' ${PROXY_CONF_TPLT}
  sed -i '/ProxyPreserveHost On/a ProxyPass /qpkapi http://127.0.0.1:9010 retry=0' ${PROXY_SSL_CONF}
  sed -i '/ProxyPreserveHost On/a ProxyPass /qpkapi http://127.0.0.1:9010 retry=0' ${PROXY_SSL_CONF_TPLT}
  

#AllowOverride All
#Require all granted

if [ $(expr $current_apache_version \>\= '2.3') -eq 1 ];then
  cat > /etc/config/apache/extra/apache-qpkg-qpk.conf <<EOF
<IfModule alias_module>
    Alias /qpk "${QPK_HOME}/html/build/"
    <Directory "${QPK_HOME}/html/build/">
        AllowOverride All
        Require all granted       
    </Directory>
</IfModule>
EOF
else
    cat > /etc/config/apache/extra/apache-qpkg-qpk.conf <<EOF
<IfModule alias_module>
    Alias /qpk "${QPK_HOME}/html/build/"
    <Directory "${QPK_HOME}/html/build/">
        AllowOverride All
        Order allow,deny
        Allow from all        
    </Directory>
</IfModule>
EOF
fi


  sed -i '/apache-qpkg-qpk.conf/d' ${APACHE_CONF}
  echo 'Include /etc/config/apache/extra/apache-qpkg-qpk.conf' >> ${APACHE_CONF}
}

reload_apache() {
  ${SYS_WEB_INIT} reload_apache
  [ $? = 0 ] || ${SYS_WEB_INIT} restart
  sleep 5
  /usr/local/apache/bin/apache_proxy -k graceful -f ${PROXY_CONF}
  /usr/local/apache/bin/apache_proxys -k graceful -f ${PROXY_SSL_CONF}
  sleep 5
}

remove_apache_cfg() {
    sed -i '/qpk\s/d' ${PROXY_CONF}
    sed -i '/qpk\s/d' ${PROXY_CONF_TPLT}
    sed -i '/qpk\s/d' ${PROXY_SSL_CONF}
    sed -i '/qpk\s/d' ${PROXY_SSL_CONF_TPLT}

    sed -i '/qpkapi\s/d' ${PROXY_CONF}
    sed -i '/qpkapi\s/d' ${PROXY_CONF_TPLT}
    sed -i '/qpkapi\s/d' ${PROXY_SSL_CONF}
    sed -i '/qpkapi\s/d' ${PROXY_SSL_CONF_TPLT}

    sed -i '/apache-qpkg-qpk.conf/d' ${APACHE_CONF}
}

case "$1" in
  start)
    ENABLED=$(/sbin/getcfg $QPKG_NAME Enable -u -d FALSE -f $CONF)
    if [ "$ENABLED" != "TRUE" ]; then
        echo "$QPKG_NAME is disabled."
        exit 1
    fi
    : ADD START ACTIONS HERE
      /bin/ln -sf $QPKG_PATH /mnt/ext/opt/qpk
      $QPKG_PATH/startcontainer.sh $QPKG_PATH
      add_apache_cfg
      reload_apache 
      ln -sf $QPKG_PATH/html/build $WEB_PATH/$QPKG_NAME
    ;;

  stop)
    : ADD STOP ACTIONS HERE
      $QPKG_PATH/stopcontainer.sh $QPKG_PATH
      remove_apache_cfg
      reload_apache
      rm -f $WEB_PATH/$QPKG_NAME
    ;;

  restart)
    $0 stop
    $0 start
    ;;

  *)
    echo "Usage: $0 {start|stop|restart}"
    exit 1
esac

exit 0
