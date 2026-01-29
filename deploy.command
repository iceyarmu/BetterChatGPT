#!/bin/sh

currentShellPath=$(cd "$(dirname "$0")"; pwd)
remoteHost="slots-mac"
remotePath="/Users/apple/Software/BetterChatGPT"
rsync -av --delete "$currentShellPath/src/" "$remoteHost:$remotePath/src/"
rsync -av --delete "$currentShellPath/public/" "$remoteHost:$remotePath/public/"
rsync -av --delete "$currentShellPath/index.html" "$remoteHost:$remotePath/index.html"
echo "Enter password for $remoteHost:"
ssh -t $remoteHost "cd $remotePath && sudo ./reload.sh"