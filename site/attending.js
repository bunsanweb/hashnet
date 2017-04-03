"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  Attending: {enumerable: true, get: () => Attending},
  checkAttending: {enumerable: true, get: () => checkAttending},
}));


const {Request, Headers, fetch, fetchDom} = require("../util/dom");
const {URL} = require("url");


class Attending {
  constructor(sitekey, publisher) {
    this.sitekey = sitekey;
    this.publisher = publisher;
  }

  request(peerUrl, selfUrl) {
    const attend = new URL(peerUrl);
    const request = new URL(selfUrl);
    this.sitekey.makeAttendingEvent(attend.host, selfUrl).
      then(event => this.publisher.putInside(event.$$.dom)).
      then(eventId => {
        request.pathname = `/hash/event/${eventId}`;
        attend.pathname = "/hash/attending";
        const headers = new Headers();
        headers.set("referer", `${request}`);
        const req = new Request(`${attend}`, {method: "POST", headers});
        return fetch(req);
      }).then(res => {
        //TBD
        console.log(res.status, res.headers.get("location"));
      }).catch(console.error);
  }
}

function checkAttending(sitekey, host, referer) {
  return fetchDom(referer).
    then(doc => sitekey.makeEvent(doc.querySelector(".hash-event"))).
    then(event => {
      // attending event check
      if (event.$peer$attending.broker !== host) {
        return Promise.reject(`invalid broker (!== host): ${host}`);
      }
      return sitekey.verifyEvent(event);
    }).then(event => {
      // attending sitekey check
      const peerUrl = `${event.$event$target}`;
      const keyUrl = new URL(peerUrl);
      keyUrl.pathname = "/hash/sitekey";
      return fetchDom(keyUrl.href).
        then(doc => sitekey.makeEvent(doc.querySelector(".hash-event"))).
        then(ev => ev.$event.actor.href === event.$event.actor.href ? ev :
             Promise.reject(`Mismatched actor: ${ev.$event.actor}`)).
        then(ev => sitekey.verifyEvent(event)).then(_ => peerUrl);
    });
}
