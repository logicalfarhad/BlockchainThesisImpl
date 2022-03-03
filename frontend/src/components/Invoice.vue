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
          <v-card-title>Sub Total :€{{ getSubTotal() }}</v-card-title>
          <v-card-text>
            TAX: {{ invoice.taxRate * 100 }}%<br />
            <v-spacer></v-spacer>
            Total: €{{ getSubTotal() + getSubTotal() * invoice.taxRate }}
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
        <v-data-table
          :headers="headers"
          :items="desserts"
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
    title: "",
    description: "",
    qty: 1,
    price: 10,
    invoice: {
      number: 123,
      paid_at: null,
      currency: "EUR",
      paid: false,
      data: new Date(),
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
        value: "name",
      },
      { text: "Calories", value: "calories" },
      { text: "Fat (g)", value: "fat" },
      { text: "Carbs (g)", value: "carbs" },
      { text: "Protein (g)", value: "protein" },
      { text: "Iron (%)", value: "iron" },
    ],
    desserts: [
      {
        name: "Port 1",
        calories: 159,
        fat: 6.0,
        carbs: 24,
        protein: 4.0,
        iron: "1%",
      },
      {
        name: "Port 2",
        calories: 237,
        fat: 9.0,
        carbs: 37,
        protein: 4.3,
        iron: "1%",
      },
      {
        name: "Port 3",
        calories: 262,
        fat: 16.0,
        carbs: 23,
        protein: 6.0,
        iron: "7%",
      },
      {
        name: "Port 4",
        calories: 305,
        fat: 3.7,
        carbs: 67,
        protein: 4.3,
        iron: "8%",
      },
      {
        name: "Port 5",
        calories: 356,
        fat: 16.0,
        carbs: 49,
        protein: 3.9,
        iron: "16%",
      },
      {
        name: "Port 6",
        calories: 375,
        fat: 0.0,
        carbs: 94,
        protein: 0.0,
        iron: "0%",
      },
      {
        name: "Port 7",
        calories: 392,
        fat: 0.2,
        carbs: 98,
        protein: 0,
        iron: "2%",
      },
      {
        name: "Port 8",
        calories: 408,
        fat: 3.2,
        carbs: 87,
        protein: 6.5,
        iron: "45%",
      },
    ],
  }),
  methods: {
    add: function () {
      // body...
      this.invoice.products.push({
        title: this.title,
        description: this.description,
        qty: this.qty,
        price: this.price,
      });
    },
    getTotal: function () {
      // body...
      console.log("getTotal");
    },
    getSubTotal: function () {
      // body...
      var SubTotal = 0;
      for (var i = this.invoice.products.length - 1; i >= 0; i--) {
        SubTotal +=
          this.invoice.products[i].price * this.invoice.products[i].qty;
      }
      return SubTotal;
    },
  },
};
</script>
<style scoped>
#right-card {
  margin-left: auto;
}
</style>
