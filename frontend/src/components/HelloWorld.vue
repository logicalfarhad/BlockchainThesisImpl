<template>
  <div class="hello">
    Hash: <input type="text" v-model="hash" /><br />
    TimeStamp:<input type="text" v-model="timestamp" />
    <br />
    <button v-on:click="getTransaction">Save</button>
    <button @click="getValue">GetValue</button>
  </div>
</template>

<script>
import { io } from "socket.io-client";
import web3 from "../Web3";
import TransactionArtifact from "../../../build/contracts/Transaction.json";
import {
  sendTransaction,
  getTransaction,
  getAllDaysInMonth,
} from "../utils/tx";
export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data() {
    return {
      hash: "",
      timestamp: "",
    };
  },
  methods: {
    async getValue() {
      const id = await web3.eth.net.getId();
      const deployedNetwork = TransactionArtifact.networks[id];
      const contract = new web3.eth.Contract(
        TransactionArtifact.abi,
        deployedNetwork.address
      );

      let logCount = await contract.methods.logCount().call();

      for (let i = 0; i < logCount; i++) {
        let value = await contract.methods.getLogbyId(i).call();
        console.log(value);
      }
      console.log(logCount);
    },
    async getTransaction() {
      const id = await web3.eth.net.getId();
      const deployedNetwork = TransactionArtifact.networks[id];

      const contract = new web3.eth.Contract(
        TransactionArtifact.abi,
        deployedNetwork.address
      );

      const addresses = await web3.eth.getAccounts();

      const gasPrize = await contract.methods
        .addLog(this.hash, this.timestamp)
        .estimateGas({ from: addresses[0] });

      contract.methods
        .addLog(this.hash, this.timestamp)
        .send({ from: addresses[0], gas: gasPrize })
        .then((receipt) => {
          console.log(receipt);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
  created() {
    sendTransaction("hola");
    getTransaction("hola.....");
    const dateList = getAllDaysInMonth(2, 2022);

    const START_DATE = "2022-02-01T23:00:00.000Z";
    const END_DATE = "2022-02-08T23:00:00.000Z";

    let startDate = new Date(START_DATE).getTime();
    let endDate = new Date(END_DATE).getTime();

    let filterd_date = dateList
      .filter((item) => item < endDate && item > startDate)
      .map((item) => {
        return new Date(item).toISOString();
      });
    console.log(filterd_date);
  },
  mounted() {
    const socket = io.connect("http://localhost:5000");
    socket.on("connect", () => {
      socket.on("data_from_mqtt", (msg) => {
        console.log(msg);
        web3.eth.net.getId().then((id) => {
          web3.eth.getAccounts().then((accounts) => {
            const deployedNetwork = TransactionArtifact.networks[id];
            const contract = new web3.eth.Contract(
              TransactionArtifact.abi,
              deployedNetwork.address
            );
            contract.methods
              .addLog(msg.logHash, msg.timeStamp)
              .estimateGas({ from: accounts[0] })
              .then((gasPrize) => {
                contract.methods
                  .addLog(msg.logHash, msg.timeStamp)
                  .send({ from: accounts[0], gas: gasPrize })
                  .then((receipt) => {
                    console.log(receipt);
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              });
          });
        });
      });
    });
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
