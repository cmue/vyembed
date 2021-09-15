import React, { Component } from 'react';
import store from 'store2';
import './App.scss';
import Player from './components/player';
import UrlBar from './components/url-bar';
import Resizer from './components/resizer';
import { PRODUCTION_SERVER, STAGING_SERVER } from './data/servers.js';

class App extends Component {
  state = {
    urlBar: {
      url: 'https://play.vidyard.com/jK9kNSqPWf88THKpVorqEn?preview=1',
      uuid: 'jK9kNSqPWf88THKpVorqEn',
      hostname: 'play-staging.vidyard.com',
      domain: 'https://play-staging.vidyard.com',
      params: {},
    },
    config: {
      server: PRODUCTION_SERVER,
      resizeWidth: 640,
      soloMode: false,
      lightMode: false,
      v3: false,
      openPanel: '',
    },
    player: null,
    logMessage: {},
  };

  constructor(props) {
    super(props);

    window['onVidyardAPI'] = () => {
      const player = window.vidyardEmbed.api.getPlayersByUUID(this.state.urlBar.uuid)[0];
      this.setState({ player });
    };

    this.setResizeWidth = this.setResizeWidth.bind(this);
    this.setOpenPanel = this.setOpenPanel.bind(this);
    this.toggleSoloMode = this.toggleSoloMode.bind(this);
    this.toggleLightMode = this.toggleLightMode.bind(this);
    this.setUrl = this.setUrl.bind(this);
    this.addLog = this.addLog.bind(this);
    this.toggleServer = this.toggleServer.bind(this);
    this.changeStagingServer = this.changeStagingServer.bind(this);
    this.saveStateToLocalStorage = this.saveStateToLocalStorage.bind(this);
    this.hydrateStateConfig = this.hydrateStateConfig.bind(this);
  }

  saveStateToLocalStorage() {
    Object.keys(this.state.config).forEach((key) => {
      store.set(`FT.state.config.${key}`, this.state.config[key]);
    });
  }

  hydrateStateConfig() {
    const config = {};
    Object.keys(this.state.config).forEach((key) => {
      if (store.has(`FT.state.config.${key}`)) {
        config[key] = store(`FT.state.config.${key}`);
      }
    });
    this.setState({ config: { ...this.state.config, ...config } });
  }

  componentWillMount() {
    this.hydrateStateConfig();
    window.addEventListener('beforeunload', this.saveStateToLocalStorage);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.saveStateToLocalStorage.bind(this));
    this.saveStateToLocalStorage();
  }

  setUrl(urlBar) {
    this.setState({ urlBar });
  }

  toggleSoloMode() {
    this.setState({
      config: {
        ...this.state.config,
        soloMode: !this.state.config.soloMode,
      },
    });
  }

  toggleLightMode() {
    this.setState({
      config: {
        ...this.state.config,
        lightMode: !this.state.config.lightMode,
      },
    });
  }

  setOpenPanel(panel) {
    this.setState({ config: { ...this.state.config, openPanel: panel } });
  }

  setResizeWidth(width) {
    this.setState({ config: { ...this.state.config, resizeWidth: width } });
  }

  addLog(logMessage) {
    // Add a random key to indicate a new unique message
    logMessage.key = Math.random();
    this.setState({ logMessage });
  }

  toggleServer() {
    const server =
      this.state.config.server === PRODUCTION_SERVER ? STAGING_SERVER : PRODUCTION_SERVER;
    this.setState({ config: { ...this.state.config, server: server } });
  }

  changeStagingServer(server) {
    this.setState({ config: { ...this.state.config, server: server } });
  }

  componentDidUpdate(prevProps, prevState) {
    // Only update the emebed script if the URL changed
    if (prevState.urlBar.url !== this.state.urlBar.url) {
      if (this.state.urlBar.params.v3) {
        // V3 API script
        const apiScript = document.createElement('script');
        apiScript.type = 'text/javascript';
        apiScript.src = `${this.state.urlBar.domain}/v0/api.js`;
        document.head.appendChild(apiScript);

        // V3 player embed script
        const embedScript = document.createElement('script');
        embedScript.type = 'text/javascript';
        embedScript.id = `vidyard_embed_code_${this.state.urlBar.uuid}`;
        embedScript.src = `${this.state.urlBar.domain}/${
          this.state.urlBar.uuid
        }.js?v=3.1.1&type=inline`;
        document.querySelector('.player-container').appendChild(embedScript);

        const interval = setInterval(() => {
          if (window.Vidyard) {
            const player = new window.Vidyard.player(this.state.urlBar.uuid);
            this.setState({ player });
            clearInterval(interval);
          }
        }, 100);
      } else {
        // V4 embed script, includes the API
        const embedScript = document.createElement('script');
        const embedVersion = this.state.urlBar.params.embed_version;
        const scriptUrl = `${embedVersion ? `v4/untagged/${embedVersion}/` : ''}v4.js`;
        embedScript.src = `${this.state.urlBar.domain}/embed/${scriptUrl}`;
        embedScript.async = true;
        embedScript.setAttribute('data-playbackurl', this.state.urlBar.hostname);
        document.head.appendChild(embedScript);
      }
      // Set the initial value of the solo/light modes with url params
      this.setState({
        config: { ...this.state.config, v3: this.state.urlBar.params.v3 },
      });
      this.setState({
        config: {
          ...this.state.config,
          soloMode: this.state.urlBar.params.solo || this.state.config.soloMode,
        },
      });
      this.setState({
        config: {
          ...this.state.config,
          lightMode: this.state.urlBar.params.light || this.state.config.lightMode,
        },
      });
    }
  }

  appClass() {
    const classes = ['app'];
    if (this.state.config.v3) classes.push('v3-embed');
    if (this.state.config.soloMode) classes.push('solo-mode');
    if (this.state.config.lightMode) classes.push('light-mode');
    return classes.join(' ');
  }

  render() {
    return (
      <div className={this.appClass()}>
        <div className="background" />
        <Resizer setResizeWidth={this.setResizeWidth} width={this.state.config.resizeWidth}>
          <UrlBar setUrl={this.setUrl} />
          <Player
            hostname={this.state.urlBar.hostname}
            uuid={this.state.urlBar.uuid}
            params={this.state.urlBar.params}
            key={this.state.urlBar.url}
            v3={this.state.config.v3}
          />
        </Resizer>
      </div>
    );
  }
}

export default App;
