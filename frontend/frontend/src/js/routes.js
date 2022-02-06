import HomePage from "../pages/home.jsx";
import AboutPage from "../pages/about.jsx";

import HistoryPage from "../pages/history.jsx";
import NotFoundPage from "../pages/404.jsx";
import Generate from "../pages/generate.jsx";

var routes = [
    {
        path: "/",
        component: HomePage,
    },
    {
        path: "/about/",
        component: AboutPage,
    },
    {
        path: "/history/",
        component: HistoryPage,
    },
    {
        path: "/generator/:generatorID/",
        component: Generate,
    },
    {
        path: "/generator/:generatorID/:imageID/",
        component: Generate,
    },
    {
        path: "(.*)",
        component: NotFoundPage,
    },
];

export default routes;
