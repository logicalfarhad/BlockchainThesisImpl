const TransactionArtifact = require("../build/contracts/Transaction.json");
const Provider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const address = '0x2C30D6CbAF87E0b11f328e31523021e8A3484F35';
const privateKey = '494b3f9f6447d53f39fe6eeb8edd09ceaadf0b87c43d6e8204ee04818578874f';

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
    console.log(receipt);
  }
  async getTransaction(startDate, endDate) {
    const contract = await this.getContract();
    let logCount = await contract.methods.logCount().call();

    const startDateEpoch = new Date(startDate).getTime();
    const endDateEpoch = new Date(endDate).getTime();
    let transactionList = [];
    for (let i = 0; i < logCount; i++) {
      let value = await contract.methods.getLogbyId(i).call();

      let timestamp = parseInt(value[1], 10);
      if (timestamp >= startDateEpoch && timestamp <= endDateEpoch) {
        let tx = {
          logHash: value[0],
          timeStamp: timestamp,
        };
        transactionList.push(tx);
      }
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