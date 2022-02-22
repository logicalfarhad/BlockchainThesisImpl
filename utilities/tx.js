const TransactionArtifact = require("../build/contracts/Transaction.json");
const Provider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const address = '0x643635D5f70D1F6d311f993cC248c270d2E678da';
const privateKey = '936dc707a66f18e0e0e8523eef7bf17d996974cf11219f3c6f3830b0331a76af';

class TransactionUtil {
  constructor() {
    const provider = new Provider(privateKey, 'http://localhost:8545/');
    this.web3 = new Web3(provider);
  }
  async sendTransaction(payload) {
    let gasPrize = await this.estimateGas(payload);
    const contract = await this.getContract();
    const receipt = await contract.methods
      .addLog(payload.logHash, payload.timeStamp)
      .send({ from: address, gas: gasPrize });

    let tx = {
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber

    }
    console.log(tx);
  }
  async getTransaction() {
    const contract = await this.getContract();
    let logCount = await contract.methods.logCount().call();

    let transactionList = [];

    for (let i = 0; i < logCount; i++) {
      let value = await contract.methods.getLogbyId(i).call();

      let tx = {
        logHash: value[0],
        timeStamp: value[1]
      };
      transactionList.push(tx);
    }
    return transactionList;
  }
  async estimateGas(payload) {
    const contract = await this.getContract();
    const gasPrize = await contract.methods
      .addLog(payload.logHash, payload.timeStamp)
      .estimateGas({ from: address });
    return gasPrize;
  }

  async getContract() {
    const id = await this.web3.eth.net.getId();
    const deployedNetwork = TransactionArtifact.networks[id];
    const contract = new this.web3.eth.Contract(
      TransactionArtifact.abi,
      deployedNetwork.address
    );
    return contract;
  }
  getAllDaysInMonth(month, year) {
    let dates = Array.from(
      { length: new Date(year, month, 0).getDate() },
      (_, i) => new Date(year, month - 1, i + 1).getTime()
    );
    return dates;
  }
}
module.exports = TransactionUtil;