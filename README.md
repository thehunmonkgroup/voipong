# VoIPong #
Play pong in a browser using your phone as the controller.

This was a demo used for http://www.cluecon.com/presentation/stupid-things-you-can-do-voip

## Installation  ##

You need [node.js](http://nodejs.org/) and [NPM](http://npmjs.org/) installed.

Install the node dependencies:

    cd /path/to/checkout/node_app; npm install

In FreeSWITCH, add the following extension:

    <!-- Internal extension for VoIPong -->
    <extension name="voipong">
      <condition field="destination_number" expression="^voipong$" break="on-true">
        <action application="socket" data="127.0.0.1:3001 async full"/>
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

## Bugs ##

Yes, mosquitoes.

## Credits ##

Javascript pong code lifted from http://zinid.com/jspong and modified heavily.

Backbone call handling code mostly written by [Adrian Rossouw](http://daemon.co.za)

