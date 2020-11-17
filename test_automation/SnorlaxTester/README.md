Front-end testing:

This is an automated test designed to check the functionality of the upload feature.
Created using Selenium package:
  - Requires the chromedriver.exe in order to use.
  - Runs on Java 14 and Chrome version 86.

Running this test will open an automated version of chrome and will load into specified host and attempt
to upload a provided image that is also located in this directory. The function dropFile() is used to simulate
the user dragging and dropping a file into the dropzone using Javascript.
