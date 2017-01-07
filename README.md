# CompSAt Gearbox

## Running the site

It is recommended to use a local sever when developing. If you are on Windows, you could use WAMP or a Python server.

You can install WAMP from [here](http://www.wampserver.com/en/).
To see the site, put the website folder inside your WAMP installation's `www` folder.

## Updating the site

This implementation uses the Application Cache API. There is a file called `offline.cache`. This configuration file tells the browser which files to cache for offline support.

When a change is made to the JS, CSS, or HTML, the browser's cache won't be updated. You must modify the `offline.cache` file. A simple change you can do is to change the time in the `Version` comment.
