#!/bin/sh
name=$(basename `pwd`)
sudo launchctl load -w /Library/LaunchDaemons/slots.${name}.plist