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
    //this.web3 = new Web3Quorum(new Web3(dev_url));
  }

  async setEnergyPrice(payload) {
    let gasPrice = await this.estimateEnergyPriceGas(payload);
    const contract = await this.getEnergyPriceContract();
    let receipt;
    try {
      receipt = await contract.methods.setCost(payload)
        .send({ from: address, gas: gasPrice });
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
    let gasPrice = await this.estimateGas(payload);
    const contract = await this.getContract();
    const receipt = await contract.methods
      .addLog(payload.logHash, payload.timeStamp)
      .send({ from: address, gas: gasPrice });
    //  console.log(receipt);
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
    const gasPrice = await contract.methods
      .addLog(payload.logHash, payload.timeStamp)
      .estimateGas({ from: address });
    return gasPrice;
  }
  async estimateEnergyPriceGas(payload) {
    const contract = await this.getEnergyPriceContract();
    const gasPrice = await contract.methods
      .setCost(payload)
      .estimateGas({ from: address });
    return gasPrice;
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