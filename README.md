# VoIPong #
Play pong in a browser using your phone as the controller.

This was a demo used for the 2012 [Cluecon](http://www.cluecon.com) presentation [Stupid Things You Can Do With VoIP](https://www.youtube.com/watch?v=cZSRkkbf1D0).

As of November 2018, tested as working in the following browsers:

 * Chrome
 * Firefox
 * Opera
 * Safari

## Installation  ##

You need [node.js](http://nodejs.org/) and [NPM](http://npmjs.org/) installed.

Install the node dependencies:

    cd /path/to/checkout/node_app; npm install

In FreeSWITCH, add the following extension:

    <!-- Internal extension for VoIPong -->
    <extension name="voipong">
      <condition field="destination_number" expression="^voipong$" break="on-true">
        <action application="set" data="socket_resume=true"/>
        <action application="socket" data="127.0.0.1:3001 async full"/>
        <action application="respond" data="500 socket failure"/>
      </condition>
    </extension>

Configure something to transfer to it.

Symlink the prompts directory to a voipong directory in your sounds directory, something like:

    ln -s /path/to/voipong/prompts /usr/local/freeswitch/sounds/en/us/callie/voipong

## Usage  ##

Start the node app:

    cd /path/to/voippong/node_app; node app.js

Point a broswer at the server on port 3000.

Call your device.

## Caveats ##

Only one browser page can be open for the game to work properly.

## Bugs ##

Yes, mosquitoes.

## Credits ##

Javascript pong code lifted from http://zinid.com/jspong and modified heavily.

Backbone call handling code mostly written by [Adrian Rossouw](http://daemon.co.za)

