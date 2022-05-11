<template>
  <v-container class="grey lighten-5">
    <v-row class="mb-10">
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
        <br />
        <v-card>
          <v-card-title> </v-card-title>
          <v-card-text>
            <Chart :data="data" :options="options" />
          </v-card-text>
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
            >
              <template v-slot:item="{ item }">
                <tr>
                  <td>
                    {{
                      item.dbtimeStamp | moment("dddd, MMMM Do YYYY, h:mm:ss a")
                    }}
                  </td>
                  <td v-if="item.matched">
                    <v-icon color="green">check_circle_outline</v-icon>
                  </td>
                  <td v-else>
                    <v-icon color="red">close</v-icon>
                  </td>
                  <td>
                    <v-btn class="pr-5" icon @click="save(item)">
                      <v-icon color="primary">visibility</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="mb-10">
      <v-col cols="7"> </v-col>
      <v-col cols="3"> </v-col>
    </v-row>

    <v-dialog v-model="dialog" width="600">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Information
        </v-card-title>

        <v-card-text v-if="infoItem">
          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>Hash from Blockchain</v-list-item-title>
              <v-list-item-subtitle>{{
                infoItem.blocklogHash
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>Hash from Database</v-list-item-title>
              <v-list-item-subtitle>{{
                infoItem.dblogHash
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>Time from Blockchain</v-list-item-title>
              <v-list-item-subtitle>{{
                infoItem.blocktimeStamp
                  | moment("dddd, MMMM Do YYYY, h:mm:ss a")
              }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title>Time from Database</v-list-item-title>
              <v-list-item-subtitle>
                {{
                  infoItem.dbtimeStamp | moment("dddd, MMMM Do YYYY, h:mm:ss a")
                }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title v-if="infoItem.matched"
                >Matched:
                <v-icon color="green">verified</v-icon></v-list-item-title
              ><v-list-item-title v-else
                >Matched:
                <v-icon color="red">highlight_off</v-icon></v-list-item-title
              >
            </v-list-item-content>
          </v-list-item>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="dialog = false"> OK </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
import Chart from "./Chart";
export default {
  components: {
    Chart,
  },
  data() {
    return {
      dialog: false,
      title: "Event Logging Dashboard",
      startDate: null,
      infoItem: null,
      endDate: null,
      data: [["Match Group", "Match Count"]],
      options: {
        height: 200,
      },
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
        { text: "Time", sortable: false, value: "blocktimeStamp" },
        { text: "Matched", sortable: true, value: "matched" },
        { text: "Info" },
      ],
    };
  },
  methods: {
    save(item) {
      this.infoItem = item;
      this.dialog = true;
    },
    async verify() {
      this.logList = [];
      this.data = [["Match Group", "Match Count"]];
      const startDate = this.$refs["startDate"].selectedDatetime?.getTime();
      const endDate = this.$refs["endDate"].selectedDatetime?.getTime();

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
          let parsedDbDate = new Date();
          parsedDbDate.setTime(dbdata[i].timeStamp);
          let parsedBlockDate = new Date();
          parsedBlockDate.setTime(blockData[i].timeStamp);
          if (
            blockData[i].logHash == dbdata[i].logHash &&
            blockData[i].timeStamp == dbdata[i].timeStamp
          ) {
            this.logList.push({
              blocklogHash: blockData[i].logHash,
              dblogHash: dbdata[i].logHash,
              dbtimeStamp: parsedDbDate,
              blocktimeStamp: parsedBlockDate,
              matched: true,
            });
          } else {
            this.logList.push({
              blocklogHash: blockData[i].logHash,
              dblogHash: dbdata[i].logHash,
              dbtimeStamp: parsedDbDate,
              blocktimeStamp: parsedBlockDate,
              matched: false,
            });
          }
        }
      }

      let totalMatched = this.logList.filter((e) => e.matched === true).length;
      let didnotMatch = this.logList.length - totalMatched;
      this.data.push(["Matched", totalMatched], ["Did not match", didnotMatch]);
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
