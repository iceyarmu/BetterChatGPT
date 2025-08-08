#!/bin/sh

currentShellPath=$(cd "$(dirname "$0")"; pwd)
remoteHost="slots-mac"
remotePath="/Users/apple/Software/BetterChatGPT"
rsync -av "$currentShellPath/src/" "$remoteHost:$remotePath/src/"
rsync -av "$currentShellPath/public/" "$remoteHost:$remotePath/public/"
rsync -av "$currentShellPath/index.html" "$remoteHost:$remotePath/index.html"
echo "Enter password for $remoteHost:"
ssh -t $remoteHost "cd $remotePath && sudo ./reload.sh"