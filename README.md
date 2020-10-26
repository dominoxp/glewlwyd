# Glewlwyd SSO server

Fork of  babelouest / glewlwyd to support MYSQL 8.0 Server

[![Build Status](https://travis-ci.com/babelouest/glewlwyd.svg?branch=master)](https://travis-ci.com/babelouest/glewlwyd)
![C/C++ CI](https://github.com/babelouest/glewlwyd/workflows/C/C++%20CI/badge.svg)
![CodeQL](https://github.com/babelouest/glewlwyd/workflows/CodeQL/badge.svg)
[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/3475/badge)](https://bestpractices.coreinfrastructure.org/projects/3475)

Single-Sign-On (SSO) server with multiple factor authentication.

![logged in](docs/screenshots/login-nopassword.png)

Authentication process supported:
- OAuth2
- OpenID Connect

Allows users authentication via multiple factors:
- Password
- One-time password (TOTP/HOTP)
- WebAuthn (Yubikey, Android devices)
- One-time password sent via e-mail
- TLS Certificate
- External OAuth2/OIDC providers
- HTTP Backend service providing Basic Authentication

Users and clients can be stored and managed from various backends:
- Database
- LDAP service
- HTTP Backend service providing Basic Authentication

New users can register a new account with the possibility to confirm their e-mail address or not. During the registration process, the new user may be expected to register their passwords, as well as other authentication factors:
- One-time password (TOTP/HOTP)
- WebAuthn (Yubikey, Android devices)
- TLS Certificate
- External OAuth2/OIDC providers

Existing users can update their e-mail by sending a confirmation link to the new e-mail.

Existing users can reset their credentials if their password or authentication schemes are lost or unavailable. Credentials can be reset by different factors:
- A link sent to the user's e-mail
- A one-time use secret code

See the [register/update e-mail/reset credentials documentation](docs/REGISTER.md) for more information on the registration, update e-mail or reset credentials features.

Based on a plugin architecture to make it easier to add or update storage backends, authentication schemes or process.

**Allows passwordless authentication.**

Adding new authentication schemes or backend storage for users and clients is possible via the plugin architecture.

The backend API server is fully written in C and uses a small amount of resources.

Its plugin architecture makes it easy to add new modules or plugins, or modify existing ones with less risks to have unmaintainable code.

Glewlwyd 2.4 [is released](https://github.com/babelouest/glewlwyd/releases/latest). Feel free to [install](docs/INSTALL.md) it, test it, use it, and [send feedback](https://github.com/babelouest/glewlwyd/issues) if you feel like it.

## Installation

The full installation documentation is available in the [Install documentation](docs/INSTALL.md).

## Docker

A docker image is available for tests on localhost, run the following command:

```shell
$ docker run --rm -it -p 4593:4593 babelouest/glewlwyd:latest
```

And open the address [http://localhost:4593/](http://localhost:4593/) on your browser.

- User: `admin`
- Password: `password`

This Docker image can be used for tests or for real use by changing the configuration files. More information in the [install documentation](docs/INSTALL.md#docker).

## Getting started

The [Getting started documentation](docs/GETTING_STARTED.md) will help administrators configure Glewlwyd's modules and authentication schemes.

## User documentation

The [user documentation](docs/USER.md) will help Glewlwyd's users manage their profile and log in to Glewlwyd.

## Core API

The full core REST API documentation is available in the [API documentation](docs/API.md)

## Plugins architecture

You can update the existing plugins or add new ones depending on your needs, check out the documentation available for each type of plugin:
- [User backend modules](src/user/)
- [Client backend modules](src/client/)
- [Authentication schemes modules](src/scheme/)
- [Plugins](src/plugin/) (Register, OAuth2 or OIDC plugins)

## Screenshots

Go to the [Screenshots](docs/screenshots) folder to get a visual idea of Glewlwyd.

## Questions, problems or feature requests

You can open an [issue](https://github.com/babelouest/glewlwyd/issues), a [pull request](https://github.com/babelouest/ulfius/pulls) or send me an [e-mail](mailto:mail@babelouest.org). Any help is much appreciated!

You can visit the IRC channel #glewlwyd on the [Freenode](https://freenode.net/) network.
