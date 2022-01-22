import React from 'react';
import { Page, Navbar, Block, BlockTitle } from 'framework7-react';

const AboutPage = () => (
  <Page>
    <Navbar title="Über WoDone" backLink="Zurück" />
    <BlockTitle>Über WoDone</BlockTitle>
    <Block strong>
      <p><b>WoDone</b> ist ein studentisches Projekt im Rahmen des Kurses "Komputer und Creativität" der Technischen Universität München. Die Entwicklungszeit betrug 4 Wochen Studienbegleitend.</p>
      <p>WoDone unterstützt Gamedesigner beim erschaffen guter Spiele und guter Storylines durch gezielte Inspiration mittels Concept art. Der Projektname steht dabei für "this World Does Not Exist".</p>
      </Block>
    <Block strong>
    <p><i>Diese App ist nicht für die Öffentlichkeit bestimmt. Sollten Sie Zufällig auf diese App gestoßen sein, informieren Sie uns bitte, da es sich dann um eine Fehlfunktion unserer Server handelt. Vielen Dank!</i></p>
    </Block>
  </Page>
);

export default AboutPage;
