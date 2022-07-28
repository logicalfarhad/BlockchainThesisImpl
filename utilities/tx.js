require('dotenv').config()
const TransactionArtifact = require("../build/contracts/Transaction.json");
const EnergyPriceArtifact = require("../build/contracts/EnergyPrice.json");
const Provider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const address = process.env.ACCOUNT_ADDRESS;
const private_key = process.env.ACCOUNT_PRIVATE_KEY;
const dev_url = process.env.BLOCKCHAIN_NETWORK_URL;

class TransactionUtil {
  constructor() {
    const provider = new Provider(private_key, dev_url);
    this.web3 = new Web3(provider);
  }

  async setEnergyPrice(payload) {
    let gasPrize = await this.estimateEnergyPriceGas(payload);
    const contract = await this.getEnergyPriceContract();

    let receipt;
    try {
      receipt = await contract.methods.setCost(payload)
        .send({ from: address, gas: gasPrize })
    } catch (err) {
      console.log(err)
    }
    return receipt;
  }
  async getEnergyPrice() {
    const contract = await this.getEnergyPriceContract();
    let price = await contract.methods.getPrice().call();
    return price;
  }
  async sendTransaction(payload) {
    console.log("payload");
    console.log(payload)
    let gasPrize = await this.estimateGas(payload);
    const contract = await this.getContract();
    const receipt = await contract.methods
      .addLog(payload.logHash, payload.timeStamp)
      .send({ from: address, gas: gasPrize });
    return receipt;
  }
  async getTransaction(startDate, endDate) {
    const contract = await this.getContract();
    let logCount = await contract.methods.logCount().call();
    const startDateEpoch = startDate;
    const endDateEpoch = endDate;
    let transactionList = [];
    for (let i = 0; i < logCount; i++) {
      let value = await contract.methods.getLogbyId(i).call();
      let timestamp = parseInt(value[1], 10);
      if (startDateEpoch && endDateEpoch) {
        if (timestamp >= startDateEpoch && timestamp <= endDateEpoch) {
          let tx = {
            logHash: value[0],
            timeStamp: timestamp,
          };
          transactionList.push(tx);
        }
      } else {
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
  async estimateEnergyPriceGas(payload) {
    const contract = await this.getEnergyPriceContract();
    const gasPrize = await contract.methods
      .setCost(payload)
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
  async getEnergyPriceContract() {
    const id = await this.web3.eth.net.getId();
    const deployedNetwork = EnergyPriceArtifact.networks[id];
    const contract = new this.web3.eth.Contract(
      EnergyPriceArtifact.abi,
      deployedNetwork.address
    );
    return contract;
  }
}
module.exports = TransactionUtil;