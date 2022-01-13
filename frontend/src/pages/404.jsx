import React from 'react';
import { Page, Navbar, Block } from 'framework7-react';

const NotFoundPage = () => (
  <Page>
    <Navbar title="404 - Seite nicht gefunden" backLink="Zurück" />
    <Block strong>
      <p>Entschuldigung</p>
      <p>Diese Seite konnte leider nicht gefunden werden.</p>
    </Block>
    <Block strong>
      <p>Vielleicht hilft Ihnen dieser <a onClick={()=>window.open('https://youtu.be/dQw4w9WgXcQ','_system', 'location=yes')}>Link</a> weiter.</p>
    </Block>
  </Page>
);

export default NotFoundPage;
