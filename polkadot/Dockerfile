FROM alpine:3.13.2

RUN apk add --update openssh-client

RUN mkdir -p /root/.ssh

RUN chmod -R 600 /root/.ssh

CMD ssh -4 -NL *:9944:localhost:9944 polkaview 
