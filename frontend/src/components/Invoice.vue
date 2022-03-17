<template>
  <v-container class="grey lighten-5">
    <v-row justify="center">
      <v-col md="4">
        <v-card class="pa2">
          <v-card-title>{{ invoice.from.name }}</v-card-title>
          <v-card-text>
            {{ invoice.from.address }} <br />
            {{ invoice.from.details }} <br />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col md="4">
        <v-card class="pa2">
          <v-card-title> Total :€{{ total }} </v-card-title>
          <v-card-text>
            <v-spacer></v-spacer>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col md="4">
        <v-card class="pa2">
          <v-card-title>{{ invoice.to.name }}</v-card-title>
          <v-card-text>
            <v-flex xs8>
              <v-text-field
                label="In cents"
                value="0"
                prefix="€"
                v-model="basePrice"
              ></v-text-field>
            </v-flex>
            Price in smart contract: {{ unitPrice }} <br />
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary lighten-1" @click="calculatePrice"
              >Calculate</v-btn
            >
            <v-btn color="primary darken-1" @click="setPrice">Set Price</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col md="4"><h2># Invoice</h2></v-col>
    </v-row>
    <v-row>
      <v-col md="8">
        <v-data-table
          :headers="headers"
          :items="sensors"
          dense
          class="elevation-1"
        ></v-data-table>
      </v-col>
      <v-col md="4">
        <v-card class="pa2">
          <v-card-title>Choose date to create invoice</v-card-title>
          <v-card-text>
            <v-flex xs8>
              <v-datetime-picker
                v-model="startDate"
                ref="startDate"
                :text-field-props="textFieldProps1"
                :date-picker-props="dateProps"
                :time-picker-props="timeProps"
                time-format="HH:mm:ss"
              >
                <template slot="actions" slot-scope="{ parent }">
                  <v-btn
                    color="primary lighten-1"
                    @click.native="parent.clearHandler"
                    >CLEAR</v-btn
                  >
                  <v-btn color="primary darken-1" @click="parent.okHandler"
                    >OK</v-btn
                  >
                </template>
              </v-datetime-picker>
            </v-flex>
            <v-flex xs8>
              <v-datetime-picker
                v-model="endDate"
                ref="endDate"
                :text-field-props="textFieldProps2"
                :date-picker-props="dateProps"
                :time-picker-props="timeProps"
                time-format="HH:mm:ss"
                allowed-dates="allowedDates"
              >
                <template slot="actions" slot-scope="{ parent }">
                  <v-btn
                    color="primary lighten-1"
                    @click.native="parent.clearHandler"
                    >CLEAR</v-btn
                  >
                  <v-btn color="primary darken-1" @click="parent.okHandler"
                    >OK</v-btn
                  >
                </template>
              </v-datetime-picker>
            </v-flex>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary lighten-1" @click="clear">CLEAR</v-btn>
            <v-btn color="primary darken-1" @click="createInvoice"
              >Create</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "Invoice",
  data: () => ({
    startDate: null,
    total: 0,
    unitPrice: 0,
    basePrice: 0,
    invoiceType: "Invoice",
    endDate: null,
    textFieldProps1: {
      prependIcon: "event",
      dense: true,
      filled: true,
      placeholder: "Please select start date",
    },
    textFieldProps2: {
      prependIcon: "event",
      dense: true,
      filled: true,
      placeholder: "Please select end date",
    },
    dateProps: {
      min: null,
      max: null,
    },
    timeProps: {
      useSeconds: true,
      scrollable: true,
      ampmInTitle: true,
      format: "24hr",
    },
    invoice: {
      from: {
        name: "Invoice from Fraunhofer FIT",
        address: "Schloss Birlinghoven",
        details: "Konrad-Adenauer-Straße ",
        postcode: "53757 Sankt Augustin",
      },
      to: {
        name: "Set eletricity price for per KWh",
        address: "Von-der-Wettern-Straße 23",
        details: "51149 Köln",
      },
    },
    headers: [
      {
        text: "Device Port",
        align: "start",
        sortable: false,
        value: "port",
      },
      { text: "Total Current(kWh)", value: "totalCurrent" },
      { text: "Total Time(HH:mm:ss)", value: "totalTime" },
      { text: "Total KWh", value: "TotalKWh" },
    ],
    sensors: [],
  }),
  async created() {
    let priceResponse = await fetch("http://localhost:5000/getPrice");
    let price = await priceResponse.json();
    if (price === "") this.unitPrice = 0;
    else this.unitPrice = parseFloat(price);
  },
  methods: {
    async createInvoice() {
      this.sensors = [];
      const startDate = this.$refs["startDate"].selectedDatetime?.toISOString();
      const endDate = this.$refs["endDate"].selectedDatetime?.toISOString();
      this.$root.$emit("showBusyIndicator", true);

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: startDate, endDate: endDate }),
      };
      const blockResponse = await fetch(
        "http://localhost:5000/getSensorData",
        requestOptions
      );
      const sensorData = await blockResponse.json();

      this.$root.$emit("showBusyIndicator", false);
      this.sensors = sensorData.map((item) => {
        return {
          port: "Port " + item.port,
          totalCurrent: (item.totalVoltage * 230) / 1000,
          totalTimeInHours: item.totalTime / 3600,
          totalTime: this.$moment.utc(item.totalTime * 1000).format("HH:mm:ss"),
          TotalKWh: this.getTotalKWh(item),
        };
      });
      this.total = 0;
    },
    clear() {},
    async setPrice() {
      this.$root.$emit("showBusyIndicator", true);
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: this.basePrice.toString() }),
      };
      let priceResponse = await fetch(
        "http://localhost:5000/setPrice",
        requestOptions
      );
      let response = await priceResponse.json();
      this.$root.$emit("showBusyIndicator", false);
      console.log(response);
      this.unitPrice = this.basePrice;
    },
    calculatePrice() {
      const sum = this.sensors
        .map((item) => item.TotalKWh)
        .reduce((prev, curr) => prev + curr, 0);
      this.total = sum * this.unitPrice / 100;
      console.log(this.total);
    },
    getTotalKWh(item) {
      let totalHours = item.totalTime / 3600;
      let totalCurrent = (item.totalVoltage * 230) / 1000;
      return totalCurrent / totalHours;
    },
  },
};
</script>
<style scoped>
#right-card {
  margin-left: auto;
}
</style>
