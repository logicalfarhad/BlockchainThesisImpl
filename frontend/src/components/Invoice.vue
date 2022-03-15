<template>
  <v-container class="grey lighten-5">
    <v-row justify="center">
      <v-col md="4">
        <v-card class="pa2">
          <v-card-title>From: {{ invoice.from.name }}</v-card-title>
          <v-card-text>
            {{ invoice.from.address }} <br />
            {{ invoice.from.details }} <br />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col md="4">
        <v-card class="pa2">
          <v-card-title
            >Sub Total: €
            {{ subTotal }}
          </v-card-title>
          <v-card-text>
            VAT: {{ invoice.taxRate * 100 }}%<br />
            <v-spacer></v-spacer>
            Total :€{{ total }}
          </v-card-text>
        </v-card>
      </v-col>
      <v-col md="4">
        <v-card class="pa2">
          <v-card-title>To : {{ invoice.to.name }}</v-card-title>
          <v-card-text>
            {{ invoice.to.address }} <br />
            {{ invoice.to.details }} <br />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col md="4"><h2># Invoice</h2></v-col>
    </v-row>
    <v-row>
      <v-col md="8">
        <v-switch
          v-model="cycle"
          @change="toggleActive(cycle)"
          :label="invoiceType"
          inset
        ></v-switch>
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
            <v-btn color="primary darken-1" @click="calculate">Calculate</v-btn>
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
    cycle: false,
    total: 0.0,
    subTotal: 0.0,
    invoiceType: "Voltage based Invoice",
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
      taxRate: 0.19,
      from: {
        name: "Fraunhofer FIT",
        address: "Schloss Birlinghoven",
        details: "Konrad-Adenauer-Straße ",
        postcode: "53757 Sankt Augustin",
      },
      to: {
        name: "Gude Systems GmbH",
        address: "Von-der-Wettern-Straße 23",
        details: "51149 Köln",
      },
      products: [{ title: "test", description: "lorem", qty: 2, price: 20 }],
    },
    headers: [
      {
        text: "Device Port",
        align: "start",
        sortable: false,
        value: "port",
      },
      { text: "Total Current", value: "totalVoltage" },
      { text: "Total Time", value: "totalTime" },
    ],
    sensors: [],
  }),
  methods: {
    async calculate() {
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
          totalVoltage: item.totalVoltage,
          totalTime: item.totalTime,
        };
      });

      if (this.cycle) {
        const sum = this.sensors
          .map((item) => item.totalVoltage)
          .reduce((prev, curr) => prev + curr, 0);

        this.total = sum;
        this.subTotal = sum + sum * this.invoice.taxRate;
      } else {
        const sum = this.sensors
          .map((item) => item.totalTime)
          .reduce((prev, curr) => prev + curr, 0);

        this.total = sum / 1000;
        this.subTotal = this.total + this.total * this.invoice.taxRate;
      }
    },
    toggleActive(item) {
      if (item) {
        this.invoiceType = "Time based Invoice";
      } else {
        this.invoiceType = "Voltage based Invoice";
      }
    },
    clear() {},
  },
};
</script>
<style scoped>
#right-card {
  margin-left: auto;
}
</style>
