# Glewlwyd User Documentation

This documentation is intended to help Glewlwyd Users to manage their profile and register authentication schemes, and understand the login workflow.

- [Profile page](#profile-page)
- [Profile Personal data](#profile-personal-data)
- [Sessions and tokens](#sessions-and-tokens)
- [Password](#password)
- [Schemes](#schemes)
  - [Webauthn](#webauthn)
  - [OTP](#otp)
  - [TLS Certificates](#tls-certificates)
- [Login to Glewlwyd](#login-to-glewlwyd)
  - [Grant access](#grant-access)
  - [Multiple sessions](#multiple-sessions)
  - [Authentication complete](#authentication-complete)

## Profile page

![profile-data](screenshots/profile-data.png)

To access its profile page, the user must go to the profile url, typically `https://glewlwyd_server_url/profile.html`. The user may have to relogin, because for security reasons, the default session timeout is set to 10 minutes.

## Profile Personal data

In the first tab of the profile page, the user is allowed to view and update some of the data related to its account. Some data may be updated such as `Name`, some data can't be updated by the user itself, such as `e-mail` or `scope`. Depending the server configuration, the administrator can add more personal data that can be viewed and possibly updated by the user.

## Sessions and tokens

![profile-session](screenshots/profile-session.png)

This tab allows the user to manually disable active sessions or refresh tokens provided by Glewlwyd.

## Password

![profile-password](screenshots/profile-password.png)

If you click on the `Password` tab, you'll open a modal window that will allow to change your user password. The new password must be at least 8 characters long.

## Schemes

In the profile page, the user will be able to manage the schemes available for its account. The following paragraphs will describe how to register the schemes available.

By design, the schemes `Retype password` and `E-mail code` can't be registered or configured in the profile page.

### Webauthn

![profile-webauthn](screenshots/profile-webauthn.png)

Webauthn is an authentication scheme that permits the user to authenticate via a dedicated device without having to retain a password. Currently, the devices available for this scheme are the following:

- Yubikeys
- Android devices (phone or tablet) if the system version is Nougat (7.0) or above

You'll need a browser compatible with Webauthn API. Recent versions of Firefox, Chrome, Edge and Opera work fine, check [Can I use](https://caniuse.com/#search=webauthn) for more details.

#### Registration

On the `Webauthn` tab, click on the button `New Component`. There, follow your browser instructions. Eventually, you should see the new registered component in the component list.

You can verify it's working properly by clicking on the `Test` button, there, follow your browser's instructions. You should see a popup message saying `Authentication succeeded`.

The component name can be changed in this page, you can also disable/enable, and delete a registered component.

### OTP

![profile-otp](screenshots/profile-otp.png)

OTP is an authentication scheme using the OATH standard, it allows the user to authenticate via one-time passwords. Glewlwyd OTP scheme allows HOTP (increment based one-time passwords) and TOTP (time-based one-time passwords).

You'll need to synchronize your OTP parameters with another device so you can authenticate via this scheme. You have several mobile apps available, as well as physical devices available to achieve this.

#### Registration

If you want to register a new OTP account, on the `OTP` tab, select the type: `HOTP` (increment based) or `TOTP` (time-based). Usually, TOTP is preferred over HOTP because it's easier to use, with a similar security level. If you want to disable this scheme for your account, select type `None`.

You need to enter a shared secret. This must be a random number, large enough to make it difficult to guess, encoded in Base32 format. If your administrator have provided you a shared secret, type it, or copy/paste it in the textbox. If you don't have one, you can generate a random secret by clicking on the `Generate` button right to the textbox.

##### HOTP parameter

Moving factor: This option is the starting offset of the HOTP configuration. Usually the default value is 0.

##### TOTP parameter

Step size (seconds): This option is the time window specifying the duration of a one-time password. This duration must be long enough to vive time to the user to read and type it, but short enough to give an attacker enough time to reuse an already used password. The tipical duration is 30 seconds.

### TLS Certificates

![profile-certificate](screenshots/profile-certificate.png)

TLS Certificates is an authentication scheme allowing the user to authenticate to Glewlwyd via the TLS certificate he or she is using to connect to Glewlwyd web service in his or her browser.

#### Registration

You need a certificate emitted by the certificate of authority that the Glewlwyd service is using.

You can either add the certificate file manually by clicking on the `browse` button, select the X509n cert file in PEM format, then click on the `Upload` button.

Also, if you're currently browsing using your certificate, you can click on the button `Add current certificate`.

#### Test certificate

If you already have registered at least one certificate and want to test the authentication with the current certificate you're using while browsinig, you can click on the `Test current certificate` button. If the authentication is successful, the certificate used to authenticate will be highlighted in the list.

#### Request a certificate to the server

If this option is enabled, you can then request a valid certificate for your authentication. After clicking on the button, a PKCS#12 certificate will be available for download. You must save this file, then import it in your browser certificate list using the provided password.

## Login to Glewlwyd

![login-new-user](screenshots/login-new-user.png)

When you're asked to login to an application that uses Glewlwyd as authenticator, you may need to enter credentials, depending on the access required and the server configuration.

During a login process, you may have to use multiple authentication schemes, and choose between them. When this happens, you have a `Scheme` dropdown button available on the bottom-left of the login window. There, you can choose between the schemes available.

### Grant access

![login-grant](screenshots/login-grant.png)

When you first login to an application via Glewlwyd, you'll be asked to grant access to the client. The client needs your permission to have access to scopes you're allowed to use. You need to grant at least one scope to the client, otherwise the client won't have access. At any time, you can go back to the login page and change the access granted to this client by clicking on the `Grant` menu available in the `Manage` dropdown button of the login page.

### Multiple sessions

![login-multiple-session](screenshots/login-multiple-session.png)

If you have multiple logins available on the Glewlwyd server, you can switch from one to another without having to logout every time. The login available are specific to a browser and a session. Use the dropdown button `Change user` on the bottom-left of the login page.

### Authentication complete

![logged-in](screenshots/logged-in.png)

If the authentication process is complete, you'll have a `Continue` butotn available. By clicking on this button, you'll be redirected to the client with credentials available to the client.