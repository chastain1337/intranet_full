import React from "react";

class Panel extends React.Component {
  render() {
    return (
      <a href={this.props.disabled ? null : "/" + this.props.sectionId}>
        <img
          className="img-fluid"
          style={this.props.disabled ? { opacity: "0.2" } : null}
          src={
            process.env.PUBLIC_URL +
            "/img/home/b_" +
            this.props.sectionId +
            ".png"
          }
        />
      </a>
    );
  }
}

export default Panel;
