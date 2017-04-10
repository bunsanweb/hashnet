#!/bin/bash

cd $(dirname $0)
docker build -t mono-uia -f Dockerfile .
docker run --rm -v $(pwd):/usr/src -w /usr/src mono-uia \
       mcs ChromeURL.cs /lib:/usr/lib/mono/accessibility/ \
       /r:UIAutomationClient.dll /r:UIAutomationTypes.dll 
docker rmi mono-uia
