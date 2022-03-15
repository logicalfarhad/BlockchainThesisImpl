<template>
  <v-container class="grey lighten-5">
    <v-row class="mb-9">
      <v-col cols="4">
        <v-card class="info-box" elevation="3" tile>
          <v-card-title>Choose date range</v-card-title>
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
            <v-spacer></v-spacer>
            <v-btn color="primary lighten-1" @click="clear">CLEAR</v-btn>
            <v-btn color="primary darken-1" @click="verify">Verify</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="7">
        <v-card class="info-box" elevation="3" tile>
          <v-card-title>{{ title }}</v-card-title>
          <v-card-text>
            <v-data-table
              dense
              :headers="headers"
              :items="logList"
              :items-per-page="5"
              class="elevation-1"
            ></v-data-table>
          </v-card-text>
        </v-card>
         <Grafico ref="grafico" />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import Grafico from "./Grafico";
export default {
  components: {
    Grafico,
  },
  data() {
    return {
      title: "Event Logging Dashboard",
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
      logList: [],
      headers: [
        {
          text: "Block Loghash",
          sortable: false,
          value: "blocklogHash",
        },
        {
          text: "Db Loghash",
          sortable: false,
          value: "dblogHash",
        },
        { text: "Block timestamp", sortable: false, value: "blocktimeStamp" },
        { text: "Db timestamp", sortable: false, value: "dbtimeStamp" },
        { text: "Matched", sortable: true, value: "matched" },
      ],
    };
  },
  methods: {
    async verify() {
      this.logList = [];
      const startDate = this.$refs["startDate"].selectedDatetime.toISOString();
      const endDate = this.$refs["endDate"].selectedDatetime.toISOString();
      this.$root.$emit("showBusyIndicator", true);

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: startDate, endDate: endDate }),
      };
      const blockResponse = await fetch(
        "http://localhost:5000/getLogsfromBlockchain",
        requestOptions
      );
      const blockData = await blockResponse.json();

      const dbresponse = await fetch(
        "http://localhost:5000/getLogsfromDb",
        requestOptions
      );
      const dbdata = await dbresponse.json();

      this.$root.$emit("showBusyIndicator", false);

      if (blockData.length === dbdata.length) {
        for (let i = 0; i < dbdata.length; i++) {
          if (
            blockData[i].logHash == dbdata[i].logHash &&
            blockData[i].timeStamp == dbdata[i].timeStamp
          ) {
            this.logList.push({
              blocklogHash: blockData[i].logHash,
              dblogHash: dbdata[i].logHash,
              blocktimeStamp: blockData[i].timeStamp,
              dbtimeStamp: dbdata[i].timeStamp.toString(),
              matched: true,
            });
          } else {
            this.logList.push({
              blocklogHash: blockData[i].logHash,
              dblogHash: dbdata[i].logHash,
              blocktimeStamp: blockData[i].timeStamp,
              dbtimeStamp: dbdata[i].timeStamp.toString(),
              matched: false,
            });
          }
        }
      }
    },
    clear() {},
  },
  created() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.dateProps.max = tomorrow.toISOString();
  },

  computed: {},
};
</script>
