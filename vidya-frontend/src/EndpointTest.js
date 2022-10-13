import React, { Component } from 'react';
import axios from 'axios';

export default class EndpointTest extends Component {

    constructor() {
        super();
        this.state = {
            testData: "No data recieved yet..."
        }
    }

    componentDidMount = () => {
        axios.get("/endpoint-test").then(response => {
            console.log(response);
            this.setState({
                testData: response.data
            })
        });
    };
    

  render() {
    return (
        <div id="id_test-data">Test data here: {this.state.testData}</div>
      )
  }
}
