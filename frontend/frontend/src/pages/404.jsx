import React from "react";
import { Page, Navbar, Block } from "framework7-react";

const NotFoundPage = () => (
    <Page>
        <Navbar title="404 - Seite nicht gefunden" backLink="Zurück" />
        <Block strong>
            <p>Entschuldigung</p>
            <p>Diese Seite gibt es leider (noch) nicht.</p>
        </Block>
        <Block strong>
            <p>
                Vielleicht hilft Ihnen dieser&nbsp;
                <a onClick={() => window.open("https://youtu.be/dQw4w9WgXcQ", "_system", "location=yes")}>Link</a>
                &nbsp;weiter.
            </p>
        </Block>
    </Page>
);

export default NotFoundPage;
