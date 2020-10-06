'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const client = require('./client');

// 1 React.Component is one of the main building blocks of the React API
// React components have two types of data - state and properties
// State is the data that the component is expected to handle itself
//   Read state from this.state
//   Set state with this.setState() - When the state is updated this way, React
//     Calculates the differences with the previous state and injects updates
//     to the DOM. Fast and efficient.
//   The convention is to initialize state with all of your attributes empty
//   in the constructor (employees is the lone attribute in this case), and
//   then look the data up in the server with componentDidMount to populate
//   the attributes. The code here follows this convention.
// Properties is data that is passed into the component. Properties do not
// change. To set them, you assign them to attributes when creating a new
// component
class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {employees: [], ip: ""};
  }

  // 2 componentDidMount() is the API invoked after React renders a component
  //
  // Pretty sure this code is basically like this Haskell (pseudo) code,
  // except the Haskell code is using a hypothetical getResponse method
  // response <- getResponse("GET", "/api/employees")
  // employees .~ response.entity._embedded.employees
  componentDidMount() {
    // get the IP from some shady website and save it to internal state
    fetch("https://api.ipify.org?format=json")
      .then(response => {
        return response.json();
      }, "jsonp")
      .then(res => {
        this.setState({ip: res.ip})
      })
      .catch(err => console.log(err));

    client({method: 'GET', path: '/api/employees'}).done(response => {
      this.setState({employees: response.entity._embedded.employees});
    });
  }

  // Render is the API that "draws" the component on the screen
  // <EmployeeList /> component
  render() {
    // You can return a text object for rendering a component in React
    return (
      "Your IP: " + this.state.ip
    )
    // return (
    //   <EmployeeList employees={this.state.employees}/>
    // )
  }
}

// Define <EmployeeList /> component
class EmployeeList extends React.Component{
  render() {
    // This mapping converts employees from an array of records into an array
    // of <Element /> React components
    const employees = this.props.employees.map(employee =>
      <Employee key={employee._links.self.href} employee={employee}/>
    );

    // This mumbo jumbo here is HTML, but it's pretty easy to see what's
    // going on. It's making a table and populating it with employees
    // This is what is returned when an <EmployeeList /> component is rendered
    return (
      <table>
        <tbody>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Description</th>
          </tr>
          {employees}
        </tbody>
      </table>
    )
  }
}

// Define <Employee /> component
class Employee extends React.Component{
  render() {
    return (
      <tr>
        <td>{this.props.employee.firstName}</td>
        <td>{this.props.employee.lastName}</td>
        <td>{this.props.employee.description}</td>
      </tr>
    )
  }
}

// Render the code with the given React component (<App />) and the DOM node
// to inject it into. In another part of the code, there is an HTML construct
// <div id="react"></div>, which serves as the entry point for our rendered
// React code.
ReactDOM.render(
  <App />,
  document.getElementById('react')
)
