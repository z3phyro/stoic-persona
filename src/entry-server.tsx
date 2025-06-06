// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="Your AI persona to answer questions for you" />
          <meta name="theme-color" content="#ffffff" />
          
          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://persona.stoic.sh/" />
          <meta property="og:title" content="Stoic Persona" />
          <meta property="og:description" content="Your AI persona to answer questions for you" />
          <meta property="og:image" content="https://persona.stoic.sh/stoic-persona.svg" />

          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="https://persona.stoic.sh/" />
          <meta property="twitter:title" content="Stoic Persona" />
          <meta property="twitter:description" content="Your AI persona to answer questions for you" />
          <meta property="twitter:image" content="https://persona.stoic.sh/stoic-persona.svg" />

          <title>Stoic Persona</title>
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
