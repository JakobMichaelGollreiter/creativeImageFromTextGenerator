import React, { useState, useEffect } from "react";

import {
  f7,
  f7ready,
  App,
  Panel,
  Views,
  View,
  Popup,
  Page,
  Navbar,
  Toolbar,
  NavRight,
  Link,
  Block,
  BlockTitle,
  LoginScreen,
  LoginScreenTitle,
  List,
  ListItem,
  ListInput,
  ListButton,
  BlockFooter,
} from "framework7-react";

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
  };

  return (
    <App {...f7params}>
      {/* Left and right panel would be here if needed*/}

      {/* Your main view, should have "view-main" class */}
      <View
        main
        className="safe-areas"
        url="/"
        browserHistory={true}
        browserHistorySeparator="#!"
      />
    </App>
  );
};
export default MyApp;
