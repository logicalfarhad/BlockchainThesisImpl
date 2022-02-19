import TransactionArtifact from "../../../build/contracts/Transaction.json";
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
      .addLog(payload.logHash, payload.timeStamp)
      .send({ from: addresses[0], gas: gasPrize });
    console.log(receipt);
  }
  async getValue() {
    const contract = await this.getContract();
    let logCount = await contract.methods.logCount().call();

    for (let i = 0; i < logCount; i++) {
      let value = await contract.methods.getLogbyId(i).call();
      console.log(value);
    }
    console.log(logCount)
  }
  async estimateGas(payload) {
    const contract = await this.getContract();
    const addresses = await this.web3.eth.getAccounts();

    const gasPrize = await contract.methods
      .addLog(payload.logHash, payload.timeStamp)
      .estimateGas({ from: addresses[0] });
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
