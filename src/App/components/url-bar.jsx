import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

class UrlBar extends Component {
  state = { url: "" };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    // Init url bar with url from window location query param if it exists
    const initUrl = "https://play-staging.vidyard.com/jK9kNSqPWf88THKpVorqEn?";
    const paramUrl = window.location.search.substring(1);
    const url = paramUrl || initUrl;

    this.setState({ url });
    this.props.setUrl(this.destructureUrl(url));
  }

  handleChange(event) {
    this.setState({ url: event.target.value });
  }

  handleFocus(event) {
    event.target.setSelectionRange(0, event.target.value.length);
  }

  handleSubmit(event) {
    event.preventDefault();
    // Go to a new page with the URL provided by the URL bad
    const newUrl = `${window.location.href.split("?")[0]}?${this.state.url}`;
    window.location.href = newUrl;
  }

  destructureUrl(url) {
    const regex = new RegExp("[^(?|/)]+", "g");
    const [protocol, hostname, uuid, params] = url.match(regex) || [];

    // Format the query params
    let queryParams = {};
    if (params) {
      queryParams = params.split("&").reduce((result, param) => {
        const [queryParam, paramValue] = param.split("=");
        result[queryParam] = paramValue;
        return result;
      }, {});
    }

    return {
      url: url || "",
      uuid: uuid || "",
      hostname: hostname || "",
      params: queryParams,
      domain: `${protocol}//${hostname}` || ""
    };
  }

  render() {
    return (
      <div className="url-bar">
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            onFocus={this.handleFocus}
            onChange={this.handleChange}
            value={this.state.url}
            ref="urlBar"
          />
          <button type="submit">
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </form>
      </div>
    );
  }
}

export default UrlBar;
