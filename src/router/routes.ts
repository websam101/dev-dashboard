import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/Dashboard/HomeView.vue") },
      {
        path: "bookmarks",
        component: () => import("pages/Bookmarks/BookmarksView.vue"),
      },
      {
        path: "projects",
        component: () => import("pages/Projects/ProjectsView.vue"),
      },
      {
        path: "ports",
        component: () => import("pages/PortManager/PortManagerView.vue"),
      },
      {
        path: "git",
        component: () => import("pages/GitManager/GitManagerView.vue"),
      },
      {
        path: "settings",
        component: () => import("pages/Settings/SettingsView.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
