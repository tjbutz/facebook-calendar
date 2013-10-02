A Facebook puzzle solution.

Author: Tino Butz

Testing
=======

For testing download and copy jsTestDriver, e.g. to this directory

http://code.google.com/p/js-test-driver/

Start Server:

java -jar JsTestDriver-1.3.3c.jar --port 4224

Open jsTestDriver clients in browser in capture mode

http://localhost:4224/capture

Start the tests:

java -jar JsTestDriver-1.3.3c.jar --tests all


Documentation
=============

For the documentation download JSDoc

http://code.google.com/p/jsdoc-toolkit/

To create the documentation call the following command in your shell (replace PATH/TO/ with your real path):

java -jar jsrun.jar app/run.js -a -t=templates/jsdoc PATH/TO/facebook/src/fb.js -d=PATH/TO/facebook/doc/

