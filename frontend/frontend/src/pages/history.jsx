import React, { useState } from "react";
import { Page, Navbar, Block, List, ListItem, BlockTitle, PageContent, f7 } from "framework7-react";

const HistoryPage = () => {
    const [hist, setHist] = useState([]);

    // History vom Server abfragen und anzeigen
    const initialize = function () {
        fetch("/api/generators", {
            method: "GET",
        })
            .then((response) => {
                if (response.status == 200) {
                    response.json().then((data) => {
                        setHist(data.generators);
                    });
                } else {
                    f7.dialog.alert("Serverfehler", "Anfrage fehlgeschlagen");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                f7.dialog.alert("Verbindungsfehler", "Es konnte keine Verbindung zum Webserver hergestellt werden.");
            });
    };
    return (
        <Page name="history" onPageBeforeIn={initialize}>
            <Navbar title="Suchverlauf" backLink="Zurück" />
            <PageContent>
                <BlockTitle>Letzte Suchanfragen</BlockTitle>
                    <List>
                        {hist.map((h, index) => (
                            <ListItem key={index} link={`/generator/${h.id}/`} title={h.search}></ListItem>
                        ))}
                    </List>
            </PageContent>
        </Page>
    );
};

export default HistoryPage;
