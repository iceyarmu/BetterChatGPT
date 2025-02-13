#!/bin/sh
name=$(basename `pwd`)
sudo launchctl unload -w /Library/LaunchDaemons/slots.${name}.plist
