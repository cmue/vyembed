import React, { Component } from "react";

class Resizer extends Component {
  state = { dragging: false };

  constructor(props) {
    super(props);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    document.addEventListener("mouseup", this.handleMouseUp);
    document.addEventListener("mousemove", this.handleMouseMove);
  }

  handleMouseDown(event) {
    event.preventDefault();
    this.setState({
      dragging: true,
      center: document.body.clientWidth / 2
    });
  }

  handleMouseUp() {
    this.setState({ dragging: false });
  }

  handleMouseMove(event) {
    if (this.state.dragging) {
      const dragValue = Math.abs(this.state.center - event.pageX) * 2;
      const newWidth = Math.max(
        Math.min(dragValue, document.body.clientWidth),
        200
      );
      this.props.setResizeWidth(newWidth);
    }
  }

  render() {
    return (
      <div className="resizer" style={{ width: `${this.props.width}px` }}>
        {this.props.children}
        <div
          className="resize-slider"
          style={{ width: `${this.props.width}px` }}
        >
          {`${this.props.width}px`}
          <div className="resize-handle" onMouseDown={this.handleMouseDown} />
          <div
            className="resize-handle right"
            onMouseDown={this.handleMouseDown}
          />
        </div>
      </div>
    );
  }
}

export default Resizer;
