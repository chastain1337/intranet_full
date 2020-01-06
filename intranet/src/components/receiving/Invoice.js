import React from "react";
import { Table, Container } from "react-bootstrap";

export default class Invoice extends React.Component {
  headers = [
    // display, object prop name, depends on original PO object
    ["SKU", "sku", true],
    ["Q.Ord", "qty_ordered", true],
    ["Part Number", "part_number", true],
    ["Description", "desc", true],
    ["Q.Rec", "qty"],
    ["Unit Price", "price_unit"],
    ["Total Price", "price_extended"]
  ];

  // the only things that don't depends on PoObj.content[line_num] are qty and price
  render() {
    const trs = this.props.invoice.content.map((invRow, invIndex) => {
      const tds = this.headers.map(header => {
        var tdContent;
        if (header[2]) {
          tdContent = this.props.po.content.find(
            poRow => poRow.line_id == invRow.line_id
          )[header[1]];
        } else {
          tdContent = invRow[header[1]];
        }
        return <td key={`row-${invIndex}-prop-${header[1]}`}>{tdContent}</td>;
      });
      return <tr key={`row-${invIndex}`}>{tds}</tr>;
    });

    const ths = this.headers.map(header => {
      return <th key={`header-${header[1]}`}>{header[0]}</th>;
    });
    return (
      <Container>
        <Table striped size="sm">
          <thead>
            <tr>{ths}</tr>
          </thead>
          <tbody>{trs}</tbody>
        </Table>
      </Container>
    );
  }
}
