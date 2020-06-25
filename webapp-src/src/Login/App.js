import React, { Component } from 'react';
import i18next from 'i18next';

import apiManager from '../lib/APIManager';
import messageDispatcher from '../lib/MessageDispatcher';
import Notification from '../lib/Notification';
import Buttons from './Buttons';
import Body from './Body';
import PasswordForm from './PasswordForm';
import NoPasswordForm from './NoPasswordForm';
import SelectAccount from './SelectAccount';
import EndSession from './EndSession';
import SessionClosed from './SessionClosed';
import DeviceAuth from './DeviceAuth';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newUser: false,
      userList: [],
      currentUser: false,
      config: props.config,
      loaded: false,
      lang: i18next.language,
      scope: [],
      mustRegisterScheme: false,
      scheme: props.config.params.scheme,
      schemeListRequired: false,
      passwordRequired: false,
      client: false,
      showGrant: true,
      showGrantAsterisk: false,
      canContinue: false,
      prompt: props.config.params.prompt,
      refresh_login: props.config.params.refresh_login,
      forceShowGrant: false,
      selectAccount: false,
      endSession: false,
      sessionClosed: false,
      deviceAuth: false,
      login_hint: props.config.params.login_hint||"",
      errorScopesUnavailable: false,
      infoSomeScopeUnavailable: false,
      errorScheme: false
    };

    this.initProfile = this.initProfile.bind(this);
    this.checkClientScope = this.checkClientScope.bind(this);
    this.checkScopeScheme = this.checkScopeScheme.bind(this);
    this.changeLang = this.changeLang.bind(this);
    this.parseSchemes = this.parseSchemes.bind(this);

    if (this.state.config) {
      this.initProfile(true);
    }

    messageDispatcher.subscribe('App', (message) => {
      if (message.type === "InitProfile") {
        this.initProfile(false);
      } else if (message.type === "loginSuccess") {
        this.setState({selectAccount: false, newUser: false, refresh_login: false, prompt: false}, () => {
          this.initProfile(false);
        });
      } else if (message.type === "NewUser") {
        this.setState({selectAccount: false, newUser: true, currentUser: false, scheme: this.state.config.params.scheme}, () => {
        });
      } else if (message.type === "GrantComplete") {
        this.setState({selectAccount: false, showGrant: false, prompt: false, forceShowGrant: false}, () => {
          this.initProfile(false);
        });
      } else if (message.type === "SelectAccount") {
        this.setState({selectAccount: true, newUser: false}, () => {
          this.initProfile(false);
        });
      } else if (message.type === "SelectAccountComplete") {
        this.setState({selectAccount: false, prompt: false}, () => {
          this.initProfile(false);
        });
      } else if (message.type === "ToggleGrant") {
        this.setState({showGrant: !this.state.showGrant});
      } else if (message.type === "newUserScheme") {
        this.setState({scheme: message.scheme});
      } else if (message.type === "SessionClosed") {
        this.setState({endSession: false, sessionClosed: true});
      }
    });
  }

  initProfile(checkPrompt) {
    apiManager.glewlwydRequest("/profile_list")
    .then((res) => {
      var newState = {};
      if (res.length) {
        newState.currentUser = res[0];
        newState.login_hint = res[0].username;
        newState.errorScopesUnavailable = !this.userHasScope(res[0], this.state.config.params.scope);
      }
      newState.userList = res;
      newState.loaded = true;
      if (checkPrompt) {
        if (this.state.prompt === "login") {
          newState.currentUser = false;
          newState.newUser = true;
        } else if (this.state.prompt === "consent") {
          newState.forceShowGrant = true;
        } else if (this.state.prompt === "select_account") {
          newState.selectAccount = true;
        } else if (this.state.prompt === "end_session") {
          newState.endSession = true;
          newState.newUser = false;
          newState.currentUser = false;
        } else if (this.state.prompt && this.state.prompt.substring(0, 6) === "device") {
          newState.deviceAuth = true;
        } else {
          newState.newUser = false;
        }
      }
      this.setState(newState, () => {
        if (this.state.config.params.client_id && this.state.config.params.scope) {
          this.checkClientScope(this.state.config.params.client_id, this.state.config.params.scope);
        } else if (this.state.config.params.scope) {
          this.checkScopeScheme(this.state.config.params.scope);
        } else {
          this.setState({showGrantAsterisk: false});
        }
      });
    })
    .fail((error) => {
      if (error.status != 401) {
        messageDispatcher.sendMessage('Notification', {type: "warning", message: i18next.t("error-api-connect")});
      }
      if (this.state.prompt === "device") {
        this.setState({deviceAuth: true, currentUser: false, userList: [], loaded: true});
      } else {
        this.setState({newUser: (!!this.state.config.params.callback_url && !!this.state.config.params.scope), showGrant: false, currentUser: false, userList: [], loaded: true});
      }
    });
  }

  checkClientScope(clientId, scopeList) {
    apiManager.glewlwydRequest("/auth/grant/" + encodeURIComponent(clientId) + "/" + encodeURIComponent(scopeList))
    .then((res) => {
      var scopeGranted = [];
      var scopeGrantedDetails = {};
      var showGrant = true;
      var showGrantAsterisk = false;
      if (res.scope.length) {
        var infoSomeScopeUnavailable = (scopeList.split(" ").length > res.scope.length);
        res.scope.forEach((scope) => {
          if (scope.name === "openid") {
            scope.granted = true;
          }
          if (scope.granted) {
            if (scope.name !== "openid") {
              showGrant = false || this.state.forceShowGrant;
            }
            scopeGranted.push(scope.name);
            scopeGrantedDetails[scope.name] = scope;
          } else {
            showGrantAsterisk = true;
          }
        });
        if (scopeGranted.length) {
          apiManager.glewlwydRequest("/auth/scheme/?scope=" + encodeURIComponent(scopeGranted.join(" ")))
          .then((schemeRes) => {
            this.setState({client: res.client, scope: res.scope, scheme: schemeRes, showGrant: showGrant, showGrantAsterisk: showGrantAsterisk, infoSomeScopeUnavailable: infoSomeScopeUnavailable, errorScopesUnavailable: false}, () => {
              this.parseSchemes();
            });
          })
          .fail((error) => {
            messageDispatcher.sendMessage('Notification', {type: "warning", message: i18next.t("login.error-scheme-scope-api")});
          });
        } else {
          this.setState({client: res.client, scope: res.scope, showGrant: true, showGrantAsterisk: true, errorScopesUnavailable: false, infoSomeScopeUnavailable: infoSomeScopeUnavailable});
        }
      } else {
        this.setState({errorScopesUnavailable: true, infoSomeScopeUnavailable: false});
      }
    })
    .fail((error) => {
      if (error.status === 404) {
        messageDispatcher.sendMessage('Notification', {type: "warning", message: i18next.t("login.error-scheme-scope-unavailable")});
      } else {
        messageDispatcher.sendMessage('Notification', {type: "warning", message: i18next.t("login.error-grant-api")});
      }
    });
  }

  checkScopeScheme(scopeList) {
    apiManager.glewlwydRequest("/auth/scheme/?scope=" + scopeList)
    .then((schemeRes) => {
      this.setState({scheme: schemeRes, showGrant: false, showGrantAsterisk: false}, () => {
        this.parseSchemes();
      });
    })
    .fail((error) => {
      if (error.status === 404) {
        messageDispatcher.sendMessage('Notification', {type: "warning", message: i18next.t("login.error-scheme-scope-unavailable")});
      } else {
        messageDispatcher.sendMessage('Notification', {type: "warning", message: i18next.t("login.error-scheme-scope-api")});
      }
    });
  }

  parseSchemes() {
    var canContinue = !!this.state.config.params.callback_url;
    var passwordRequired = false;
    var schemeListRequired = false;
    var scheme = false;
    var mustRegisterScheme = false;
    for (var scopeName in this.state.scheme) {
      if (canContinue) {
        var scope = this.state.scheme[scopeName];
        if (scope.available && scope.password_required && !scope.password_authenticated) {
          canContinue = false;
          passwordRequired = true;
          schemeListRequired = false;
          scheme = false;
          break;
        } else if (!schemeListRequired && canContinue) {
          for (var groupName in scope.schemes) {
            var group = scope.schemes[groupName];
            var groupAuthenticated = false;
            schemeListRequired = group;
            group.forEach((curScheme) => {
              mustRegisterScheme = false;
              if (curScheme.scheme_authenticated) {
                groupAuthenticated = true;
                schemeListRequired = false;
                scheme = false;
              } else if ((!scheme || scheme.scheme_last_login < curScheme.scheme_last_login) && curScheme.scheme_registered) {
                scheme = curScheme;
              } else if (!curScheme.scheme_registered && !scheme) {
                mustRegisterScheme = true;
              }
            });
            if (!groupAuthenticated) {
              canContinue = false;
              break;
            }
          }
        }
      }
    }
    if (!passwordRequired && this.state.refresh_login) {
      passwordRequired = true;
    }
    if (canContinue) {
      scheme = false;
    }
    this.setState({canContinue: canContinue, passwordRequired: passwordRequired, schemeListRequired: schemeListRequired, scheme: scheme, errorScheme: (!scheme && !canContinue), mustRegisterScheme: mustRegisterScheme});
  }

  changeLang(e, lang) {
    i18next.changeLanguage(lang)
    .then(() => {
      this.setState({lang: lang});
    });
  }
  
  userHasScope(user, scope_list) {
    var hasScope = false;
    if (scope_list) {
      scope_list.split(" ").forEach(scope => {
        if (user.scope.indexOf(scope) > -1) {
          hasScope = true;
        }
      });
    }
    return hasScope;
  }

	render() {
    if (this.state.config) {
      var body = "", message, scopeUnavailable;
      if (this.state.loaded) {
        if (this.state.endSession) {
          body = <EndSession config={this.state.config} userList={this.state.userList} currentUser={this.state.currentUser}/>;
        } else if (this.state.sessionClosed) {
          body = <SessionClosed config={this.state.config}/>;
        } else if (this.state.deviceAuth) {
          body = <DeviceAuth config={this.state.config} userList={this.state.userList} currentUser={this.state.currentUser}/>;
        } else {
          if (this.state.mustRegisterScheme && !this.state.errorScopesUnavailable) {
            message = <div className="alert alert-warning" role="alert">{i18next.t("login.warning-not-registered-scheme")}</div>
          } else if (this.state.errorScheme && !this.state.errorScopesUnavailable) {
            message = <div className="alert alert-warning" role="alert">{i18next.t("login.warning-error-scheme")}</div>
          } else {
            var noCallback, noScope;
            if (!this.state.config.params.callback_url) {
              noCallback = <div className="alert alert-warning" role="alert">{i18next.t("login.warning-no-callback-url")}</div>;
            }
            if (!this.state.config.params.scope) {
              noScope = <div className="alert alert-warning" role="alert">{i18next.t("login.warning-no-scope")}</div>;
            }
            message = <div>{noCallback}{noScope}</div>;
          }
          if ((this.state.newUser || this.state.passwordRequired)) {
            if (!this.state.scheme) {
              body = <PasswordForm config={this.state.config} username={this.state.login_hint} currentUser={this.state.currentUser} userList={this.state.userList} callbackInitProfile={this.initProfile}/>;
            } else {
              body = <NoPasswordForm config={this.state.config} username={this.state.login_hint} userList={this.state.userList} callbackInitProfile={this.initProfile} scheme={this.state.scheme}/>;
            }
          } else if (this.state.selectAccount) {
            body = <SelectAccount config={this.state.config} userList={this.state.userList} currentUser={this.state.currentUser}/>;
          } else {
            body = <Body config={this.state.config} 
                         currentUser={this.state.currentUser} 
                         client={this.state.client} 
                         scope={this.state.scope} 
                         scheme={this.state.scheme} 
                         schemeListRequired={this.state.schemeListRequired} 
                         showGrant={this.state.showGrant} 
                         infoSomeScopeUnavailable={this.state.infoSomeScopeUnavailable}
                         validLogin={(!!this.state.config.params.callback_url && !!this.state.config.params.scope)}/>;
            if (this.state.errorScopesUnavailable) {
              scopeUnavailable = <div className="alert alert-danger" role="alert">{i18next.t("login.error-scope-unavailable")}</div>
            }
          }
        }
      }
      var langList = [];
      this.state.config.lang.forEach((lang, i) => {
        if (lang === i18next.language) {
          langList.push(<a className="dropdown-item active" href="#" key={i}>{lang}</a>);
        } else {
          langList.push(<a className="dropdown-item" href="#" onClick={(e) => this.changeLang(e, lang)} key={i}>{lang}</a>);
        }
      });
      return (
        <div aria-live="polite" aria-atomic="true" className="glwd-container">
          <div className="card center glwd-card" id="userCard" tabIndex="-1" role="dialog">
            <div className="card-header">
              <nav className="navbar navbar-expand-lg navbar-light">
                <a className="navbar-brand" href="#" data-toggle="collapse">
                  <img className="mr-3" src="img/logo-login.png" alt="logo"/>
                  {i18next.t("login.menu-title")}
                </a>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                  <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                  <ul className="navbar-nav mr-auto">
                    {/* Placeholder */}
                  </ul>
                  <div className="btn-group" role="group">
                    <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownLang" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <i className="fas fa-language"></i>
                    </button>
                    <div className="dropdown-menu" aria-labelledby="dropdownLang">
                      {langList}
                    </div>
                  </div>
                </div>
              </nav>
            </div>
            {message}
            <div className="card-body">
              {scopeUnavailable}
              {body}
            </div>
            <div className="card-footer">
              <Buttons config={this.state.config} 
                       currentUser={this.state.currentUser} 
                       userList={this.state.userList}
                       client={this.state.client}
                       showGrant={this.state.showGrant} 
                       showGrantAsterisk={this.state.showGrantAsterisk} 
                       newUser={this.state.newUser} 
                       newUserScheme={this.state.scheme} 
                       canContinue={this.state.canContinue && !this.state.errorScopesUnavailable} 
                       schemeListRequired={this.state.schemeListRequired}
                       selectAccount={this.state.selectAccount} />
            </div>
          </div>
          <Notification loggedIn={true}/>
        </div>
      );
    } else {
      return (
        <div aria-live="polite" aria-atomic="true" className="glwd-container">
          <div className="card center glwd-card" id="userCard" tabIndex="-1" role="dialog">
            <div className="card-header">
              <h4>
                <span className="badge badge-danger">
                  {i18next.t("error-api-connect")}
                </span>
              </h4>
            </div>
          </div>
        </div>
      );
    }
	}
}

export default App;
