A mock intranet for an online reatiler: server, front-end, and database.

Ensure that node and mongodb are properly installed.

To run app:

    Copy files to one directory
    "npm install" on "intranet" and "intranet_backend"
    Run database" "$ mongod --dbpath={path to 'data' folder}"
    Run server from within the "intranet_backend" directory: "$ nodemon" (server should be listneing on localhost:4000)
    Run the front-end from within the "inranet" directory: "$ npm start" (front-end should be listening on localhost:3000)