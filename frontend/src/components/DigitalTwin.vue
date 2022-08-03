<template>
  <v-container class="grey lighten-5">
    <v-row>
      <v-col md="4">
        <v-card>
          <v-card-title> Change threshold value</v-card-title>
          <v-card-text>
            <v-text-field
              dense
              label="Specify a threshold value"
              v-model="threshold"
              type="number"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary darken-1" @click="setthreshold"> Set </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
          <div>
            <v-divider></v-divider>
            <v-card-text>
              <div>
                Please set a new threshold value for current consumption. If any
                ports consume more current than the specified thresh hold value, the 8th
                port will be switched on automatically.
              </div>
            </v-card-text>
          </div>
        </v-card>
      </v-col>

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
      portConfig: null,
      THRESHHOLD: process.env.VUE_APP_CURRENT_THRESHHOLD,
      threshold: 0.0,
      statusList: [
        [false, false, false, false],
        [false, false, false, false],
      ],
      cols: 2,
      eventList: [],
      headers: [
        { text: "Event Id", sortable: false, value: "eventId" },
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
 //  this.$root.$emit("showBusyIndicator", false);

    this.portConfig = [
      {
        id: 1,
        indx: 0,
        jndx: 0,
      },
      {
        id: 2,
        indx: 0,
        jndx: 1,
      },
      {
        id: 3,
        indx: 0,
        jndx: 2,
      },
      {
        id: 4,
        indx: 0,
        jndx: 3,
      },
      {
        id: 5,
        indx: 1,
        jndx: 0,
      },
      {
        id: 6,
        indx: 1,
        jndx: 1,
      },
      {
        id: 7,
        indx: 1,
        jndx: 2,
      },
      {
        id: 8,
        indx: 1,
        jndx: 3,
      },
    ];
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
    setthreshold() {
      this.THRESHHOLD = this.threshold;
    },
  },

  async mounted() {
    const APP_URL = process.env.VUE_APP_BACKEND_BASE_URL;
    this.socket = io.connect(APP_URL);
    this.socket.on("connect", async () => {
      console.log("Connect");
      console.log(this.THRESHHOLD);
      this.socket.on("data_from_mqtt", async (msg) => {
        if (msg.v > this.THRESHHOLD && msg.idx < 8) {
          console.log(msg.v);
          if (this.statusList[1][3] === false) {
            let obj = {
              i: 1,
              j: 3,
              status: true,
              _eventMsg: "Port 8 switched on because of Port " + msg.idx,
            };
            //  await this.tx.sendTransaction(obj);
            this.statusList[1][3] = true;
            this.statusList = [...this.statusList];
          }
        }
      });

      this.socket.on("telemetry_from_mqtt", async (msg) => {
           this.$root.$emit("showBusyIndicator", false);

        for (let port of msg.portstates) {
          let portNo = port.port;

          let config = this.portConfig.filter((item) => {
            return item.id == portNo;
          })[0];

          console.log(config);

          let obj = {
            i: config.indx,
            j: config.jndx,
            status: port.state == 1 ? true : false,
            _eventMsg: "Changed because of telemetry feedback",
          };

         let porttx = await this.tx.getPortById(config.indx, config.jndx);
          console.log(porttx);
          if (porttx.status !== obj.status) {
            this.statusList[config.indx][config.jndx] = obj.status;
            this.statusList = [...this.statusList];
            await this.tx.sendTransaction(obj);
            this.eventList = await this.tx.getPastEvents();
            this.socket.emit("change_port_status", {
              status: obj.status,
              portNumber: config.id,
            });

            this.eventList = [...this.eventList];
          }
        }
      });
    });
  },
};
</script>
