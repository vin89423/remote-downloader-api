# Remote Downloader API

This project still under construction.

### Introduction
Home server is a common device nowadays, some of the NAS also contain manageable Linux system. I have a home server too, I use it as a 24x7 router. I think it can go further, so i build this remote downloader.

* _This downloader use sqlite to store login and missions, no external database required._

### Requirement
Node JS > v14.16.1

### How to use
1. Add .env file, add the following config inside. Ignore this if use default config.
```
APP_NAME
BASE_URL
PORT
TZ
SESSION_SECRET
DOWNLOAD_FOLDER
```

2. Run `npm install`

3. Run app with pm2 or other node app management tools.
