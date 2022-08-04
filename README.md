#### Master Thesis Implementation
##### Title: Investigation of a Blockchain-Based Implementation of a Power Control Device.  

#### Application Components
There are three components in the repository:

- Blockchain network 
- Backend
- Front End

## Blockchain network
Quorum defined in the [blockchain/network/4-nodes-istanbul-tessera-docker-compose] (blockchain/quorum). It is a four-node network generated using the [quorum-wizard](https://github.com/ConsenSys/quorum-wizard). It uses the Istanbul consensus algorithm.
#### Running Containers
Bash scripts are provided to [start.sh](scripts/start.sh) and [stop.sh](scripts/stop.sh) the containers.
Please note that, docker must be installed in the system to run the blockchain network. 

#### Starting the backend component
To start the backend application, these commands need to be executed:
```sh
cd BlockchainThesisImpl
npm install
npm start
```
This will start the backend application on 5000 port. Please note that MongoDB data should be installed and running in the system to save the IoT device logs in the MongoDB database.

#### Starting the frontend component
To start the frontend application, these commands need to be executed:
```sh
cd BlockchainThesisImpl/frontend
npm install
npm start
```
This will start the frontend application on 8080 port. Browse http://localhost:8080/ to see the output. 

#### Remarks
Please make sure to have a look at the .env files in the frontend and backend applications.
These .env files contain essential information for running the application.



## Contact
For any issue you can contact me at the following email addresses:
### farhad.ali@rwth-aachen.de
### farhad.ali@iais.fraunhofer.de
