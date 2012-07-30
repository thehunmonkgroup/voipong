# VoIPong #
Play pong in a browser using your phone as the controller.

This was a demo used for http://www.cluecon.com/presentation/stupid-things-you-can-do-voip

## Usage  ##

In FreeSWITCH, add the following extension:

    <!-- Internal extension for VoIPong -->
    <extension name="voipong">
      <condition field="destination_number" expression="^voipong$" break="on-true">
        <action application="socket" data="127.0.0.1:3001 async full"/>
      </condition>
    </extension>

Configure something to transfer to it.

Start the node app:

    cd /path/to/voippong; node app.js

Point a broswer at the server on port 3000.

Call your device.

## Bugs ##

Yes, mosquitoes.

