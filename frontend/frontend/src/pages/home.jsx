import { BlockTitle, Button, f7, Icon, List, ListInput, ListItem, Navbar, NavTitle, Page } from "framework7-react";
import React, { useState } from "react";
import ExplanationBlock from "../components/explanationBlock";
const HomePage = function () {
    const [searchstring, setSearchstring] = useState("");

    const requestGenerator = function () {
        console.log(searchstring);
        f7.dialog.preloader("Laden");
        fetch("/api/generators", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ search: searchstring }),
        })
            .then((response) => {
                if (response.status == 201) {
                    response.json().then((data) => {
                        f7.dialog.close();
                        setSearchstring("");
                        f7.views.main.router.navigate(`/generator/${data.id}/`);
                    });
                } else {
                    f7.dialog.close();
                    f7.dialog.alert("Serverfehler", "Anfrage fehlgeschlagen");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                f7.dialog.close();
                f7.dialog.alert("Verbindungsfehler", "Es konnte keine Verbindung zum Webserver hergestellt werden.");
            });
    };

    return (
        <Page name="home">
            <Navbar>
                <NavTitle sliding>WoDone</NavTitle>
            </Navbar>
            {/* Page content */}

            {f7.device.desktop && <ExplanationBlock></ExplanationBlock>}

            <BlockTitle>Suchbegriff eingeben</BlockTitle>
            <List noHairlinesMd>
                <ListInput outline clearButton input={false}>
                    <input
                        type="text"
                        slot="input"
                        placeholder="Search"
                        value={searchstring}
                        onChange={(e) => setSearchstring(e.target.value)}
                        onKeyUp={(e) => {
                            if (e.code == "Enter") requestGenerator();
                        }}
                    ></input>
                </ListInput>
                <ListItem>
                    <span style={{ display: f7.device.desktop ? "none" : "default" }}></span>
                    <Button fill onClick={requestGenerator}>
                        Bilder Generieren
                    </Button>
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
                <ListItem
                    title="Einstellungen"
                    link="/settings/"
                    //external
                    //target="_blank"
                >
                    <Icon slot="media" f7="gear"></Icon>
                </ListItem>
            </List>
        </Page>
    );
};
export default HomePage;
