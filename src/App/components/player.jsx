import * as React from "react";

const Player = ({ uuid, hostname, params, v3 }) => {
  const src = `https://${hostname}/${uuid}.jpg`;

  // Add data- to each query param to add to the v4 img placeholder
  const v4Params = Object.keys(params).reduce((result, param) => {
    result[`data-${param}`] = params[param];
    return result;
  }, {});

  return (
    <div className="player-container">
      {uuid !== "" &&
        !v3 && (
          <img
            className="vidyard-player-embed"
            src={src}
            alt="player"
            data-uuid={uuid}
            data-v="4"
            data-type="inline"
            {...v4Params}
          />
        )}
    </div>
  );
};

export default Player;
