import EnergyPriceArtifact from "../../../build/contracts/EnergyPrice.json";
import PortSettingArtifact from "../../../build/contracts/PortSetting.json";
import Web3 from 'web3';
import moment from 'moment';
export class TransactionUtil {
    TYPE = '';
    constructor() {
        this.web3 = new Web3('http://localhost:8545');
        this.transactionList = [];
    }

    async getPastEvents() {
        if (this.TYPE === "portSettingContract") {
            let options = {
                fromBlock: 0,
                toBlock: 'latest'
            };
            const contract = await this.getContract();
            let eventList = await contract.getPastEvents('portEvent', options);
            for (const event of eventList) {
                let block = await this.web3.eth.getBlock(event.blockNumber);
                this.transactionList.push({
                    creationTime: moment(block.timestamp * 1000).format('MMMM Do YYYY, h:mm:ss a'),
                    blockNumber: event.blockNumber,
                    gasUsed: block.gasUsed,
                    eventId: event.id,
                    eventMsg: event.returnValues.eventMsg
                })
            }
            return this.transactionList;
        }
    }


    async sendTransaction(payload) {
        let gasPrize = await this.estimateGas(payload);
        const contract = await this.getContract();
        const addresses = await this.web3.eth.getAccounts();

        if (this.TYPE === 'energyContract') {
            const receipt = await contract.methods
                .setCost(payload.price)
                .send({ from: addresses[0], gas: gasPrize });

            return receipt;

        } else if (this.TYPE === "portSettingContract") {
            await contract.methods
                .changePortState(payload.i, payload.j, payload.status, payload._eventMsg)
                .send({ from: addresses[0], gas: gasPrize });
        }

    }
    async getPortList() {
        const contract = await this.getContract();
        let portList = await contract.methods.getPortList().call()
        return portList;
    }
    async estimateGas(payload) {
        if (this.TYPE === "energyContract") {
            const contract = await this.getContract();
            const addresses = await this.web3.eth.getAccounts();

            const gasPrize = await contract.methods
                .setCost(payload.price)
                .estimateGas({ from: addresses[0] });
            return gasPrize;
        } else if (this.TYPE === "portSettingContract") {
            const contract = await this.getContract();
            const addresses = await this.web3.eth.getAccounts();

            const gasPrize = await contract.methods
                .changePortState(payload.i, payload.j, payload.status, payload._eventMsg)
                .estimateGas({ from: addresses[0] });
            return gasPrize;
        }

    }

    async getContract() {
        const id = await this.web3.eth.net.getId();
        if (this.TYPE === "energyContract") {
            const deployedNetwork = EnergyPriceArtifact.networks[id];
            const contract = new this.web3.eth.Contract(
                EnergyPriceArtifact.abi,
                deployedNetwork.address
            );
            return contract;

        } else if (this.TYPE === "portSettingContract") {
            const deployedNetwork = PortSettingArtifact.networks[id];
            const contract = new this.web3.eth.Contract(
                PortSettingArtifact.abi,
                deployedNetwork.address
            );
            return contract;
        }

    }
}