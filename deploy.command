#!/bin/sh

currentShellPath=$(cd "$(dirname "$0")"; pwd)
remoteHost="vpn"
remotePath="/home/ec2-user/BetterChatGPT"
rsync -av --delete "$currentShellPath/src/" "$remoteHost:$remotePath/src/"
rsync -av --delete "$currentShellPath/public/" "$remoteHost:$remotePath/public/"
rsync -av --delete "$currentShellPath/index.html" "$remoteHost:$remotePath/index.html"
ssh -t $remoteHost "sudo systemctl restart betterchatgpt"