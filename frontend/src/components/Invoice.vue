<template>
  <v-container class="grey lighten-5">
    <v-row justify="center">
      <v-col md="4">
        <v-card class="pa2">
          <v-card-title> Total :€{{ total.toFixed(3) }} </v-card-title>
          <v-card-text>
            <v-spacer></v-spacer>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col md="4"> </v-col>
      <v-col md="4">
        <v-card class="pa2">
          <v-card-title>Set eletricity price for per kWh</v-card-title>
          <v-card-text>
            <v-flex xs8>
              <v-text-field
                label="In euro"
                value="0"
                prefix="€"
                v-model="basePrice"
              ></v-text-field>
            </v-flex>
            Price in smart contract: {{ unitPrice }}€ <br />
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary darken-1" @click="calculatePrice"
              >Calculate</v-btn
            >
            <v-btn color="primary darken-1" @click="setPrice">Set Price</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col md="8">
        <v-card class="pa2">
          <v-card-title> Energy consumption statistics</v-card-title>
          <v-card-text>
            <v-spacer></v-spacer>
            <v-data-table
              :headers="headers"
              :items="sensors"
              dense
              class="elevation-1"
            ></v-data-table> </v-card-text
        ></v-card>
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
                    color="primary darken-1"
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
            <!--  <v-btn color="primary darken-1" @click="clear">CLEAR</v-btn> -->
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
import { TransactionUtil } from "../utils/tx";
export default {
  name: "Invoice",
  data: () => ({
    startDate: null,
    tx: null,
    total: 0,
    APP_URL: process.env.VUE_APP_BACKEND_BASE_URL,
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
    headers: [
      {
        text: "Device Port",
        align: "start",
        sortable: false,
        value: "port",
      },
      { text: "Total Power(Kilowatt)", value: "totalPower" },
      { text: "Total Time(In hour)", value: "totalHour" },
      { text: "Total Energy(kWh)", value: "totalEnergy" },
    ],
    sensors: [],
  }),
  async created() {
    this.$root.$emit("showBusyIndicator", true);
    let priceResponse = await fetch(this.APP_URL + "/getPrice");
    let price = await priceResponse.json();
    if (price === "") this.unitPrice = 0;
    else this.unitPrice = parseFloat(price);
    this.tx = new TransactionUtil();
    this.tx.TYPE = "energyContract";
    this.$root.$emit("showBusyIndicator", false);
  },
  methods: {
    async createInvoice() {
      this.$root.$emit("showBusyIndicator", true);
      this.sensors = [];
      const startDate = this.$refs["startDate"].selectedDatetime?.getTime();
      const endDate = this.$refs["endDate"].selectedDatetime?.getTime();
      this.$root.$emit("showBusyIndicator", true);

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: startDate, endDate: endDate }),
      };
      const blockResponse = await fetch(
        this.APP_URL + "/getSensorData",
        requestOptions
      );
      const sensorData = await blockResponse.json();
      this.$root.$emit("showBusyIndicator", false);
      this.sensors = sensorData.map((item) => {
        return {
          port: "Port " + item.port,
          totalPower: (item.totalCurrent * 230) / 1000, //converting ampere to kW
          totalHour: item.totalHour,
          totalEnergy: this.getTotalEnergy(item),
        };
      });
      this.total = 0;

      this.$root.$emit("showBusyIndicator", false);
    },
    clear() {},
    async setPrice() {
      this.$root.$emit("showBusyIndicator", true);
      try {
        let response = await this.tx.sendTransaction({
          price: this.basePrice.toString(),
        });
        if (response.status) {
          this.unitPrice = this.basePrice;
          this.basePrice = 0;
        }
      } catch (error) {
        console.log(error);
        this.$root.$emit("showBusyIndicator", false);
      } finally {
        this.$root.$emit("showBusyIndicator", false);
      }
    },
    calculatePrice() {
      console.log(this.sensors);
      const sum = this.sensors
        .map((item) => item.totalEnergy)
        .reduce((prev, curr) => prev + curr, 0);
      console.log(sum);
      this.total = sum * this.unitPrice;
      console.log(this.total);
    },
    getTotalEnergy(item) {
      let totalHours = item.totalHour;
      let totalPower = (item.totalCurrent * 230) / 1000;
      return totalPower * totalHours;
    },
  },
};
</script>
<style scoped>
#right-card {
  margin-left: auto;
}
</style>
