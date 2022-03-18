<template>
  <GChart type="PieChart" :options="options" :data="data" />
</template>

<script>
import { GChart } from "vue-google-charts";
export default {
  name: "App",
  props: {
    title: String,
    data: Array,
    options: Object,
  },
  components: {
    GChart,
  },
  data() {
    return {};
  },
};
</script>
