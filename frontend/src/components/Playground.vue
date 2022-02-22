<template>
  <div class="hello">
    Hash: <input type="text" v-model="hash" /><br />
    TimeStamp:<input type="text" v-model="timestamp" />
    <br />
    <button @click="getValue">GetValue</button>
    <button @click="getLogs">GetLogs</button>
    <button @click="emptyDb">emptyDb</button>
  </div>
</template>

<script>
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
    getValue() {},
    async getLogs() {
      const response = await fetch("http://localhost:5000/getLogs");
      const logs = await response.json();
      console.log(logs);
    },

    async emptyDb() {
      const response = await fetch("http://localhost:5000/removeDb");
      const numberRemoved = await response.json();
      console.log(numberRemoved);
    },
  },
  created() {
    /*
    const dateList = this.tx.getAllDaysInMonth(2, 2022);

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
    */
  },
  mounted() {},
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
