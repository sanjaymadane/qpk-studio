#! /bin/sh
export QCONTACTZ_SERVER_IP=$(ip route | grep -i via | awk {'print $3'} | head -n1)
cd /server
node app.js
#pm2 start --no-daemon process.json --only api