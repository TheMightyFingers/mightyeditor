MightyEditor
============
Web version: http://mightyeditor.mightyfingers.com 

Video tutorial: https://www.youtube.com/watch?v=7dk2naCCePc

Home page: http://mightyfingers.com 

Forum: http://www.html5gamedevs.com/forum/26-mightyeditor/

Please use chrome / chromium with MightyEditor


Requirements
============
* chrome / chromium browser
* npm
* nodejs
* fontforge and woff2_compress for the font conversions

set up
============

* clone the repository
* open server/config-dev.js
* change **host** to **127.0.0.1** or *null* or your **ip_address**
* save the file and close
* execute following commands

```no-highlight
cd server
npm install
cd ../
chmod +x ./startdev
./startdev
```
or
```no-highlight
cd server
npm install
node Server.js
```

open in browser http://0.0.0.0:8080
