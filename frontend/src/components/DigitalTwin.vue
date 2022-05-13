<template>
  <v-container class="grey lighten-5">
    <v-row>
      <v-col md="4"> </v-col>
      <v-col md="4">
        <v-card>
          <v-card-title>Switch board </v-card-title>
          <v-card-text>
            <v-row v-for="(column, i) in columns" :key="i">
              <fragment v-for="(item, j) in column" :key="j">
                <v-col md="6" v-if="i == 0">
                  <v-list flat>
                    <v-list-item>
                      <v-list-item-icon>
                        <v-switch
                          inset
                          v-model="statusList[i][j]"
                          @change="changeStatus(statusList[i][j], i, j, item)"
                        >
                        </v-switch>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title
                          v-text="columns[i][j].text"
                        ></v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col md="6" v-else-if="i == 1">
                  <v-list flat>
                    <v-list-item>
                      <v-list-item-icon>
                        <v-switch
                          inset
                          v-model="statusList[i][j]"
                          @change="changeStatus(statusList[i][j], i, j, item)"
                        >
                        </v-switch>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title
                          v-text="columns[i][j].text"
                        ></v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-col>
              </fragment>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col md="4"></v-col>
    </v-row>
    <v-row>
      <v-col md="2"> </v-col>
      <v-col md="8">
        <v-card class="pa2">
          <v-card-title> Port switching event logs </v-card-title>
          <v-card-text>
            <v-spacer></v-spacer>
            <v-data-table
              dense
              :headers="headers"
              :items="eventList"
              :items-per-page="5"
              class="elevation-1"
            >
            </v-data-table> </v-card-text></v-card
      ></v-col>
      <v-col md="2"> </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { TransactionUtil } from "../utils/tx";
import { io } from "socket.io-client";

export default {
  data() {
    return {
      items: [],
      socket: io(),
      tx: null,
      statusList: [
        [false, false, false, false],
        [false, false, false, false],
      ],
      cols: 2,
      eventList: [],
      headers: [
        { text: "Event id", sortable: false, value: "eventId" },
        { text: "Creation time", sortable: false, value: "creationTime" },
        { text: "Block no.", sortable: false, value: "blockNumber" },
        { text: "Gas used", sortable: false, value: "gasUsed" },
        { text: "Event message", value: "eventMsg" },
      ],
    };
  },
  computed: {
    columns() {
      let columns = [];
      let mid = Math.ceil(this.items.length / this.cols);
      for (let col = 0; col < this.cols; col++) {
        columns.push(this.items.slice(col * mid, col * mid + mid));
      }
      return columns;
    },
  },
  async created() {
    this.tx = new TransactionUtil();
    this.tx.TYPE = "portSettingContract";
    for (let i = 1; i <= 8; i++) {
      this.items.push({ text: "Port " + i });
    }
    let ports = await this.tx.getPortList();
    for (let i = 0; i < ports.length; i++) {
      for (let j = 0; j < ports[i].length; j++) {
        this.statusList[i][j] = ports[i][j].status;
      }
    }
    this.$root.$emit("showBusyIndicator", true);
    this.eventList = await this.tx.getPastEvents();
    this.eventList = this.eventList.sort(
      (a, b) => b.blockNumber - a.blockNumber
    );
    this.eventList = [...this.eventList];
    this.$root.$emit("showBusyIndicator", false);
  },
  methods: {
    async changeStatus(status, i, j, item) {
      this.$root.$emit("showBusyIndicator", true);
      this.statusList[i][j] = status;
      let obj = {
        i: i,
        j: j,
        status: status,
        _eventMsg: status
          ? "User switched on " + item.text
          : "User switched off " + item.text,
      };
      await this.tx.sendTransaction(obj);
      this.eventList = await this.tx.getPastEvents();
      this.socket.emit("change_port_status", {
        status: status,
        portNumber: item.text,
      });
      this.$root.$emit("showBusyIndicator", false);
    },
  },
  async mounted() {
    const THRESHHOLD = process.env.VUE_APP_CURRENT_THRESHHOLD;
    const APP_URL = process.env.VUE_APP_BACKEND_BASE_URL;
    this.socket = io.connect(APP_URL);
    this.socket.on("connect", async () => {
      this.socket.on("data_from_mqtt", async (msg) => {
        if (msg.v > THRESHHOLD && msg.idx < 8) {
          console.log(msg.v);
          if (this.statusList[1][3] === false) {
            let obj = {
              i: 1,
              j: 3,
              status: true,
              _eventMsg: "Port 8 switched on because of Port " + msg.idx,
            };
            await this.tx.sendTransaction(obj);
            this.statusList[1][3] = true;
            this.statusList = [...this.statusList];
          }
        }
      });
    });
  },
};
</script>
