This repository includes working solution of Software Architect Test Project,it includes the following solutions
1) REST API solution using express server node js
2) unit test solution using mocha and supertest Modules
3) command line application solution using node js and golang

<h3>Express entrypoint app.js</h3>
RUN the express app using npm start command.Please ensure to change env variable NODE_ENV to production in order to run the application in clustered mode and change the above mentioned environment variable to development in order to run the test suite using npm test command or mocha test.js command.
<h3>Express Endpoints</h3>
1) /upload : accepts a POST request and with expected file parameter.ONLY TEXT files are allowed to be uploaded.Please look at the following example
![FILEUPLOAD](./images/fileupload.png)
<h3>COMMAND LINE NODE.js</h3>
RUN the command line application using npm run cli command

<h3>COMMAND LINE golang</h3>
RUN the command line application developed using golang by executing the commandLine.exe or by running the go run main.go command


