import Artifact from "../../../build/contracts/EnergyPrice.json";
import Web3 from 'web3';
export class TransactionUtil {
    constructor() {
        this.web3 = new Web3('http://localhost:8545');
    }
    async sendTransaction(payload) {
        let gasPrize = await this.estimateGas(payload);
        const contract = await this.getContract();
        const addresses = await this.web3.eth.getAccounts();
        const receipt = await contract.methods
            .setCost(payload)
            .send({ from: addresses[0], gas: gasPrize });
        return receipt;
    }
    async estimateGas(payload) {
        const contract = await this.getContract();
        const addresses = await this.web3.eth.getAccounts();

        const gasPrize = await contract.methods
            .setCost(payload)
            .estimateGas({ from: addresses[0] });
        return gasPrize;
    }

    async getContract() {
        const id = await this.web3.eth.net.getId();
        const deployedNetwork = Artifact.networks[id];
        const contract = new this.web3.eth.Contract(
            Artifact.abi,
            deployedNetwork.address
        );
        return contract;
    }
}