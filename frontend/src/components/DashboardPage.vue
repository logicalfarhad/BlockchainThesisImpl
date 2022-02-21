<template>
  <div>
    <DashboardCard title="My journey with Vue" />
    <v-divider></v-divider>
    <v-divider></v-divider>
    <v-divider></v-divider>
    <DashboardCard title="Blogging with Vue"/>
  </div>
</template>
<script>
//import OfferedResourcesCard from "@/components/cards/offeredresources/OfferedResourcesCard.vue";
// import SourceTypesCard from "@/components/cards/sourcetypes/SourceTypesCard.vue";
//import FileTypesCard from "@/components/cards/filetypes/FileTypesCard.vue";
// import DataAccessesCard from "@/components/cards/dataaccesses/DataAccessesCard.vue";
import DashboardCard from "./DashboardCard.vue";
export default {
  components: {
    DashboardCard,
    //  OfferedResourcesCard,
    // SourceTypesCard,
    //  FileTypesCard,
    // DataAccessesCard,
  },
  data() {
    return {};
  },
};
</script>
