A mock intranet for an online reatiler: server, front-end, and database.

Ensure that node and mongodb are properly installed and added to PATH.

To run app:

    Clone repo
    Begin the "mongod" process on the default server (localhost:27017)
    Navigate to intranet_full and run "$ mongo mongo-setup.js", this will create the mock "intranet" database in your default mongo     data directory, consisting of 3 collections: 1) chapters, 2) vendors, 3) products
    Run "npm install" on "intranet" and "intranet_backend"
    From intranet_backend, run "node index.js" to start the backend server listening on localhost:400
    From intranet, run the front-end from within the "inranet" directory: "$ npm start" (front-end should be listening on localhost:3000)
