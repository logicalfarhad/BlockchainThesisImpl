import DashboardPage from "./DashboardPage.vue";
import HelloWorld from "./HelloWorld.vue";
export default {
    getPageStructure() {
        return [{
            path: "dashboard",
            name: "Dashboard",
            icon: "icon-dashboard",
            component: DashboardPage,
            subpages: []
        },
        {
            path: "settings",
            name: "Settings",
            icon: "icon-settings",
            component: HelloWorld,
            subpages: []
        }
        ];
    },
    getDisplayName(name) {
        let displayName = name;
        if (displayName.indexOf('(') != -1) {
            displayName = displayName.substring(0, displayName.indexOf('('));
        }
        return displayName;
    }
}