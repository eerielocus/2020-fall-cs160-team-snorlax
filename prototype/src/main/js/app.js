'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const client = require('./client');
const follow = require('./follow');

const root = '/api';

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
    this.state =
      { employees: [], attributes: [], pageSize: 2, links: {}, ip: "" };
    this.updatePageSize = this.updatePageSize.bind(this);
    this.onCreate = this.onCreate.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onNavigate = this.onNavigate.bind(this);
  }

  // load information from the server into memory
  // Loads employees, attributes, pageSize, and links, as well as schema
  // information
  loadFromServer(pageSize) {
    // call follow, we would probably always use client as the api and
    // root as the rootPath. In this case, our relationship array is
    // a single element that is a dictionary with employees as the
    // relation and includes params (size: pageSize)
    // follow will return the json object associated with the relation that
    // we asked for (employees).
    follow(client, root, [
      {rel: 'employees', params: {size: pageSize}}]
    ).then(employeeCollection => {
      // I believe 'then' is JavaScript's version of the monadic bind
      // operation, so employeeCollection seems to be coming out of a box from
      // what is returned by follow, which is probably correct...
      // I looked it up, 'then' is invoked by a Promise and returns a Promise,
      // which fits the monadic bind pattern of M a -> (a -> M b) -> M b
      // I think the actual types would be something like
      // Promise JSON -> (JSON -> Promise JSON) -> Promise JSON
      return client({
        method: 'GET',
        path: employeeCollection.entity._links.profile.href,
        headers: {'Accept': 'application/schema+json'}
      }).then(schema => {
        this.schema = schema.entity;
        return employeeCollection;
      });
    }).done(employeeCollection => {
      // I'm quite sure that 'done' is part of the Promise module that
      // specifies what to do when a Promise is completed (the difference with
      // 'then' is that 'done' does not return a value (i.e. m ())).
      // Update our state in memory with the values that we found on the
      // server's employeeCollection.
      this.setState({
        employees: employeeCollection.entity._embedded.employees,
        attributes: Object.keys(this.schema.properties),
        pageSize: pageSize,
        links: employeeCollection.entity._links});
    });
  }

  // re-render the page with the new page size, if it is different.
  // Because a new page size value causes changes to all the navigation links,
  // it is best to refetch the data and start from the beginning
  updatePageSize(pageSize) {
    if (pageSize !== this.state.pageSize) {
      this.loadFromServer(pageSize);
    }
  }

  // What to do when creating a new employee (add it, then navigate to it)
  // I think the newEmployee passed in and the POST request
  // with the entity: newEmployee is adding the employee to the database
  // (the detail of this is taken care of by Spring Data REST, I'm sure).
  onCreate(newEmployee) {
    // Get the 'employees' JSON object, then add the newEmployee to it with
    // a POST request and entity: newEmployee
    follow(client, root, ['employees']).then(employeeCollection => {
      return client({
        method: 'POST',
        path: employeeCollection.entity._links.self.href,
        entity: newEmployee,
        headers: {'Content-Type': 'application/json'}
      })
    // reload the page with the appropriate page size and the new employee
    }).then(response => {
      return follow(client, root, [
        {rel: 'employees', params: {'size': this.state.pageSize}}]);
    // navigate to the new employee (it will be the last entry, but if there is
    // no 'last' key in _links, that means we're already at the last page).
    }).done(response => {
      if (typeof response.entity._links.last !== "undefined") {
        this.onNavigate(response.entity._links.last.href);
      } else {
        this.onNavigate(response.entity._links.self.href);
      }
    });
  }

  // What to do when deleting an employee (simply call DELETE on that
  // employee's link)
  onDelete(employee) {
    client({method: 'DELETE', path: employee._links.self.href})
      .done(response => {
        this.loadFromServer(this.state.pageSize);
      });
  }

  // navigate with GET to the navUri, then update the state
  onNavigate(navUri) {
    client({method: 'GET', path: navUri}).done(employeeCollection => {
      this.setState({
        employees: employeeCollection.entity._embedded.employees,
        attributes: this.state.attributes,
        pageSize: this.state.pageSize,
        links: employeeCollection.entity._links
      });
    });
  }

  // 2 componentDidMount() is the API invoked after React renders a component
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

    // load our internal state information from the server
    this.loadFromServer(this.state.pageSize);
  }

  // Render is the API that "draws" the component on the screen
  render() {
    return (
      <div>
        <DisplayIP ip={this.state.ip}/>
        <CreateDialog attributes={this.state.attributes}
          onCreate={this.onCreate}/>
        <EmployeeList employees={this.state.employees}
          links={this.state.links}
          pageSize={this.state.pageSize}
          onNavigate={this.onNavigate}
          onDelete={this.onDelete}
          updatePageSize={this.updatePageSize}/>
      </div>
    )
  }
}

// Idk if there's a simpler way to do this, but this is just to display the
// IP for the sake of example
class DisplayIP extends React.Component {
  render() {
    return (
      "Your IP: " + this.props.ip
    )
  }
}

// Define <EmployeeList /> component
class EmployeeList extends React.Component{
  constructor(props) {
    super(props);
    this.handleInput = this.handleInput.bind(this);
    this.handleNavFirst = this.handleNavFirst.bind(this);
    this.handleNavPrev = this.handleNavPrev.bind(this);
    this.handleNavNext = this.handleNavNext.bind(this);
    this.handleNavLast = this.handleNavLast.bind(this);
  }

  // Handle the input of keystrokes to get the new pageSize. This handles
  // input on EACH character entered. If the character entered is a valid
  // digit, then let the <App /> knonw that there is a new pageSize. If it
  // is not a digit, then strip that character from the input. Note that
  // previous digits are still in the input, so if you enter 42, the pageSize
  // will be updated to 4 once you enter it, then updated to 42 once you enter
  // 2.
  handleInput(e) {
    e.preventDefault();
    const pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value;
    if (/^[0-9]+$/.test(pageSize)) {
      this.props.updatePageSize(pageSize);
    } else {
      ReactDOM.findDOMNode(this.refs.pageSize).value =
        pageSize.substring(0, pageSize.length - 1);
    }
  }

  // We create navigation buttons. These 4 functions handle what to do when
  // the buttons are clicked.
  handleNavFirst(e){
    e.preventDefault();
    this.props.onNavigate(this.props.links.first.href);
  }

  handleNavPrev(e) {
    e.preventDefault();
    this.props.onNavigate(this.props.links.prev.href);
  }

  handleNavNext(e) {
    e.preventDefault();
    this.props.onNavigate(this.props.links.next.href);
  }

  handleNavLast(e) {
    e.preventDefault();
    this.props.onNavigate(this.props.links.last.href);
  }

  render() {
    // This mapping converts employees from an array of records into an array
    // of <Element /> React components
    const employees = this.props.employees.map(employee =>
      <Employee key={employee._links.self.href} employee={employee}
        onDelete={this.props.onDelete}/>
    );

    // create a list of navlinks buttons
    const navLinks = [];
    if ("first" in this.props.links) {
      navLinks.push(
        <button key="first" onClick={this.handleNavFirst}>&lt;&lt;</button>);
    }
    if ("prev" in this.props.links) {
      navLinks.push(
        <button key="prev" onClick={this.handleNavPrev}>&lt;</button>);
    }
    if ("next" in this.props.links) {
      navLinks.push(
        <button key="next" onClick={this.handleNavNext}>&gt;</button>);
    }
    if ("last" in this.props.links) {
      navLinks.push(
        <button key="last" onClick={this.handleNavLast}>&gt;&gt;</button>);
    }

    // At the top there is an input field for pageSize, if they want to change
    // it. Then a table generated from {employees} with the {navLinks}
    // This is what is returned when an <EmployeeList /> component is rendered
    return (
      <div>
        {/* collect input of every keystroke... I guess */}
        <input ref="pageSize" defaultValue={this.props.pageSize}
          onInput={this.handleInput}/>
        <table>
          <tbody>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Description</th>
              <th></th>
            </tr>
            {employees}
          </tbody>
        </table>
        <div>
          {navLinks}
        </div>
      </div>
    )
  }
}

// Define <Employee /> component
class Employee extends React.Component {

  constructor(props) {
    super(props);
    this.handleDelete = this.handleDelete.bind(this);
  }

  // We display a delete button next to the employee's information. This
  // function handles what to do when it's clicked.
  handleDelete() {
    this.props.onDelete(this.props.employee);
  }

  render() {
    return (
      <tr>
        <td>{this.props.employee.firstName}</td>
        <td>{this.props.employee.lastName}</td>
        <td>{this.props.employee.description}</td>
        <td>
          <button onClick={this.handleDelete}>Delete</button>
        </td>
      </tr>
    )
  }
}

// My best guess for what's goin on here:
// In render, this function creates an <input> text element for each attribute
// which asks the user to fill in the needed information for a new employee,
// first name, last name, description. It creates a reference to that
// information with the field in the input element ref={attribute}, which
// allows that information to be searched with ReactDOM.findDOMNode (the
// value to search for is this.refs[attribute], apparently where the ref gets
// saved by React). We then have a button that calls handleSubmit, which
// collects the information about each attribute entered by the user to
// create newEmployee, then invokes this.props.onCreate(newEmployee), where
// the employee is added to the database with a POST request to the server.
class CreateDialog extends React.Component {

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // Handle what to do when the submit button is clicked to add a new employee
  // e is an event
  handleSubmit(e) {
    // prevent the event from bubbling up the hierarchy
    e.preventDefault();

    const newEmployee = {};
    // for all attributes in employee, find the input associated with them
    // (this.refs[attribute]) and collect the value into newEmployee[attribute]
    this.props.attributes.forEach(attribute => {
      newEmployee[attribute] =
        ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
    });

    // Invoke App.onCreate
    this.props.onCreate(newEmployee);

    // clear out the dialog's inputs
    this.props.attributes.forEach(attribute => {
      ReactDOM.findDOMNode(this.refs[attribute]).value = '';
    });

    // Navigate away from the dialog to hide it.
    window.location = "#";
  }

  render() {
    const inputs = this.props.attributes.map(attribute =>
      <p key={attribute}>
        <input type="text" placeholder={attribute} ref={attribute}
          className="field"/>
      </p>
    );

    return (
      <div>
        <a href="#createEmployee">Create</a>
        <div id="createEmployee" className="modalDialog">
          <div>
            <a href="#" title="Close" className="close">X</a>
            <h2>Create new employee</h2>
            <form>
              {inputs}
              <button onClick={this.handleSubmit}>Create</button>
            </form>
          </div>
        </div>
      </div>
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
