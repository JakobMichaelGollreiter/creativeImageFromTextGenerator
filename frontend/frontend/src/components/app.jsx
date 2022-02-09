//////////////////////////////////////////////
// WoDone
// frontend/frontend/src/components/app.jsx
// Authors: Tobias Höpp
//
// Root Komponente
//////////////////////////////////////////////
import { App, View } from "framework7-react";
import React from "react";
import routes from "../js/routes";
import store from "../js/store";

const MyApp = () => {
    // Framework7 Parameters
    const f7params = {
        name: "WoDone", // App name
        theme: "auto", // Automatic theme detection
        // App store
        store: store,
        // App routes
        routes: routes,
        autoDarkTheme: true,
    };

    return (
        <App {...f7params}>
            {/* Left and right panel would be here if needed*/}

            {/* Your main view, should have "view-main" class */}
            <View main className="safe-areas" url="/" browserHistory={true} browserHistorySeparator="#!" />
        </App>
    );
};
export default MyApp;
