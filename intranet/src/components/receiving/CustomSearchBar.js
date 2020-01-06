import React from "react";
import Fuse from "fuse.js";
import {
  InputGroup,
  FormControl,
  Dropdown,
  DropdownButton
} from "react-bootstrap";

/*
Requires:
    toBeSearched = array of objects to be searched
    headers = the prop names of those objects; an array in [Display Name, propName] format
    parent component will need to have a handle function
*/

export default class CustomSearchBar extends React.Component {
  state = {
    selectedQueryHeader: "",
    filterQuery: ""
  };

  submitFilter = () => {
    if (
      this.state.filterQuery === "" ||
      this.state.selectedQueryHeader === ""
    ) {
      return this.props.handleQueryChange(this.props.toBeSearched);
    }

    const searchProp = this.props.headers[this.state.selectedQueryHeader][1];
    const searchString = this.state.filterQuery;
    let newDisplayedPOs = this.props.toBeSearched;

    if (!isNaN(this.props.toBeSearched[1][searchProp])) {
      switch (true) {
        case searchString.indexOf(">") >= 0:
          newDisplayedPOs = this.props.toBeSearched.filter(
            po => po[searchProp] > Number(searchString.replace(">", 0))
          );
          break;

        case searchString.indexOf("<") >= 0:
          newDisplayedPOs = this.props.toBeSearched.filter(
            po => po[searchProp] < Number(searchString.replace("<", 0))
          );
          break;

        default:
          newDisplayedPOs = this.props.toBeSearched.filter(
            po => po[searchProp] == Number(searchString.replace(">", 0))
          );
          break;
      }
    } else {
      var options = {
        keys: [searchProp], //this.props.headers.map(header => header[1]),
        id: searchProp
      };
      var fuse = new Fuse(this.props.toBeSearched, options);
      const results = fuse.search(searchString);
      newDisplayedPOs = this.props.toBeSearched.filter(po =>
        results.includes(po[searchProp])
      );
    }
    this.props.handleQueryChange(newDisplayedPOs);
  };

  handleFilterQueryChange = e => {
    this.setState({ filterQuery: e.target.value });
  };

  filterHeaderSelect = e => {
    this.setState({ selectedQueryHeader: e }, () => this.submitFilter());
  };

  render() {
    return (
      <InputGroup>
        <FormControl
          placeholder="Filter..."
          value={this.state.filterQuery}
          onChange={this.handleFilterQueryChange}
          onBlur={this.submitFilter}
        />

        <DropdownButton
          as={InputGroup.Append}
          variant="outline-secondary"
          title={
            this.state.selectedQueryHeader === ""
              ? "Select Filter"
              : this.props.headers[this.state.selectedQueryHeader][0]
          }
          id="input-group-dropdown-2"
          onSelect={this.filterHeaderSelect}>
          {this.props.headers.map((header, index) => (
            <Dropdown.Item key={`dropdown-${header[0]}`} eventKey={index}>
              {header[0]}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </InputGroup>
    );
  }
}
