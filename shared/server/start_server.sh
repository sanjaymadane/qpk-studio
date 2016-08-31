cd /server
pm2 start --no-daemon process.json --only api
#node app.js