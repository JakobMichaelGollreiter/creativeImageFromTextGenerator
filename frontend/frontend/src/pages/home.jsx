import React from "react";
import {
  Page,
  Navbar,
  NavLeft,
  NavTitle,
  NavTitleLarge,
  NavRight,
  Link,
  Toolbar,
  Block,
  BlockTitle,
  List,
  ListItem,
  Row,
  Col,
  Button,
  ListInput,
  ListItemRow,
  App,
  f7,
  Icon,
} from "framework7-react";
import { append } from "dom7";
import ExplanationBlock from "../components/explanationBlock";

const HomePage = () => (
  <Page name="home">
    {/* Top Navbar */}
    <Navbar>
      {/* <Navbar large sliding={false}>
      <NavLeft>
        <Link
          iconIos="f7:menu"
          iconAurora="f7:menu"
          iconMd="material:menu"
          panelOpen="left"
        />
      </NavLeft> */}
      <NavTitle sliding>WoDone</NavTitle>
      {/* <NavRight>
        <Link
          iconIos="f7:menu"
          iconAurora="f7:menu"
          iconMd="material:menu"
          panelOpen="right"
        />
      </NavRight>
      <NavTitleLarge>WoDone</NavTitleLarge> */}
    </Navbar>
    {/* Toolbar */}
    {/* <Toolbar bottom>
      <Link>Left Link</Link>
      <Link>Right Link</Link>
    </Toolbar> */}
    {/* Page content */}

    {f7.device.desktop && <ExplanationBlock></ExplanationBlock>}

    <BlockTitle>Suchbegriff eingeben</BlockTitle>
    <List noHairlinesMd>
      <ListInput
        type="text"
        placeholder="Search"
        outline
        clearButton
      ></ListInput>
      <ListItem>
        <span
          style={{ display: f7.device.desktop ? "none" : "default" }}
        ></span>
        <Button fill href="/generator/ID-TODO/generate/">
          Bilder Generieren
        </Button>{" "}
        {/* Hier fehlt eine Menge Logik: Zunächst muss ein neuer Eintrag im Suchverlauf erstellt werden (mit globaler ID aus dem Backend), dann erst darf auf die Bildgenerierung für diese ID verlinkt werden! */}
      </ListItem>
    </List>

    {!f7.device.desktop && <ExplanationBlock></ExplanationBlock>}

    <List>
      <ListItem title="Suchverlauf" link="/history/">
        <Icon slot="media" f7="rectangle_stack_fill"></Icon>
      </ListItem>
      <ListItem title="Über die App" link="/about/">
        <Icon slot="media" f7="person_3_fill"></Icon>
      </ListItem>
      <ListItem title="Einstellungen" link="/settings/">
        <Icon slot="media" f7="gear"></Icon>
      </ListItem>
    </List>

    {/* (Nicht benötigt, kann nur noch zum abkucken nützlich sein) */}
    {/*
    <BlockTitle>Navigation</BlockTitle>
    <List>
      <ListItem link="/about/" title="About"/>
      <ListItem link="/form/" title="Form"/>
    </List>

    <BlockTitle>Modals</BlockTitle>
    <Block strong>
      <Row>
        <Col width="50">
          <Button fill raised popupOpen="#my-popup">Popup</Button>
        </Col>
        <Col width="50">
          <Button fill raised loginScreenOpen="#my-login-screen">Login Screen</Button>
        </Col>
      </Row>
    </Block>

    <BlockTitle>Panels</BlockTitle>
    <Block strong>
      <Row>
        <Col width="50">
          <Button fill raised panelOpen="left">Left Panel</Button>
        </Col>
        <Col width="50">
          <Button fill raised panelOpen="right">Right Panel</Button>
        </Col>
      </Row>
    </Block>

    <List>
      <ListItem
        title="Dynamic (Component) Route"
        link="/dynamic-route/blog/45/post/125/?foo=bar#about"
      />
      <ListItem
        title="Default Route (404)"
        link="/load-something-that-doesnt-exist/"
      />
      <ListItem
        title="Request Data & Load"
        link="/request-and-load/user/123456/"
      />
    </List> */}
  </Page>
);
export default HomePage;