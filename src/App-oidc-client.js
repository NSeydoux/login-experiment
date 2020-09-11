/**
 * Copyright 2020 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, { Component, useState, useEffect } from "react";
import "regenerator-runtime/runtime";

import {
  OidcClient,
  default as Oidc,
  UserManager
} from "oidc-client"

Oidc.Log.logger = console;
Oidc.Log.level = Oidc.Log.DEBUG;

export default function App() {
  const oidcOptions = {
    authority: 'https://broker.demo-ess.inrupt.com/',
    client_id: '18e434c4-d8cd-4e3b-b4a1-a6e00cfbbda7',
    client_secret: 'ANvm_ZIthvp4io6P9x7eWyoT7VS2QixBx01UvobKpjYSXgTHD6jTM6CwXX3_RyfJ9UKQhxy-auOJVWdSty20i08',
    redirect_uri: 'http://localhost:3001/',
    post_logout_redirect_uri: 'http://localhost:3001/',
    response_type: 'code',
    scope: 'openid webid',
    filterProtocolClaims: true,
    loadUserInfo: true
  }

  const [client, setClient] = useState(new OidcClient(oidcOptions));
  // const [client, setClient] = useState(new UserManager(oidcOptions));
  const [resource, setResource] = useState("");
  const [issuer, setIssuer] = useState("https://broker.demo-ess.inrupt.com/");
  const [data, setData] = useState(null);

  // const defaultFetch = 

  const [fetcher, setFetcher] = useState(
    () => async (target) => {
    console.log(`Default fetch to ${target}`)
    return fetch(target)
    .then(response => response.text())
    .then(data => {console.log(data); return data})
    .then(data => {setData(data)});
  });
  
  useEffect(() => {
    const authCode =
      new URL(window.location.href).searchParams.get("code");
    if (authCode) {
      client.processSigninResponse()
        .then((response) => {
          console.log(`signin response:  ${JSON.stringify(response, null, "  ")}`);
          setFetcher(() => buildAuthFetcher(response.access_token));
        }).catch((err) => {
          console.error(err);
        });
    }
  }, []);

  const handleLogin = (e) => {
    // The default behaviour of the button is to resubmit. 
    // This prevents the page from reloading.
    e.preventDefault();
    // client.signinPopup({state: "mySession", ...oidcOptions});
    client.createSigninRequest({ state: { bar: 15 } }).then(function (req) {
      console.log(`signin request ${JSON.stringify(req, null, "  ")}`);
      window.location = req.url;
    }).catch((err) => {
      console.error(err);
    });
  }

  const buildAuthFetcher = (token) => {
    return (target) => {
      console.log(`Fetching with token ${token}`);
      fetch(target, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(response => response.text())
      .then(data => {setData(data)});
    };
  }

  const handleFetch = (e) => {
    // The default behaviour of the button is to resubmit. 
    // This prevents the page from reloading.
    e.preventDefault();
    console.log(`Calling the current fetcher`);
    fetcher(resource);
  };

  return (
    <div>
      <main>
        <h1>
          Authenticate and fetch
        </h1>
        <div>
          <form>
            <input
              type="text"
              value={issuer}
              onChange={e => {
                setIssuer(e.target.value);
              }}
            />
            <button onClick={(e) => handleLogin(e)}>Log In</button>
          </form>
        </div>
        <hr />
        <div>
          <input
            type="text"
            value={resource}
            onChange={e => {
              setResource(e.target.value);
            }}
          />
          <button onClick={(e) => handleFetch(e)}>Fetch</button>
        </div>
        <pre>
          {data}
        </pre>
      </main>
    </div>
  )
}