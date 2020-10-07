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
    follow(client, root, [
      {rel: 'employees', params: {size: pageSize}}]
    ).then(employeeCollection => {
      // It's obvoius enough that this code is getting the particular
      // schema of this entity to save into memory, but I'm less certain
      // about where exactly employeeCollection is coming from. I believe
      // 'then' is JavaScript's version of the monadic bind operation,
      // so employeeCollection seems to be coming out of a box from
      // what is returned by follow, which is probably correct... I just
      // don't know what is really being returned by follow. OKAY I looked
      // up then and it is invoked by a Promise and returns a Promise,
      // which fits the monadic bind pattern of M a -> (a -> M b) -> M b
      // I think the actual types would be something like
      // Promise (employeeCollection) -> (employeeCollection ->
      // Promise employeeCollection) -> Promise (employeeCollection)
      return client({
        method: 'GET',
        path: employeeCollection.entity._links.profile.href,
        headers: {'Accept': 'application/schema+json'}
      }).then(schema => {
        this.schema = schema.entity;
        return employeeCollection;
      });
    }).done(employeeCollection => {
      // I'm quite sure that done is part of the Promise module that
      // specifies what to do when a Promise is completed.
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

  // What to do upon creation of a new employee (show that employee that was
  // just added).
  // I think the newEmployee passed in and the POST request
  // with the entity: newEmployee is adding the employee to the database
  // (the detail of this is taken care of by Spring Data REST, I'm sure).
  onCreate(newEmployee) {
    // invoke follow on employees, then handle the POST response
    // then follow again on employees with the correct pageSize (I think
    // this re-renders the page, if I'm not mistaken, but maybe I am)
    // then finish with navigation to the 'last' hypermedia control
    // hey this stuff is getting easier to read
    follow(client, root, ['employees']).then(employeeCollection => {
      return client({
        method: 'POST',
        path: employeeCollection.entity._links.self.href,
        entity: newEmployee,
        headers: {'Content-Type': 'application/json'}
      })
    }).then(response => {
      return follow(client, root, [
        {rel: 'employees', params: {'size': this.state.pageSize}}]);
    }).done(response => {
      if (typeof response.entity._links.last !== "undefined") {
        this.onNavigate(response.entity._links.last.href);
      } else {
        this.onNavigate(response.entity._links.self.href);
      }
    });
  }

  // What to do upon deletion of an employee
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

    // client({method: 'GET', path: '/api/employees'}).done(response => {
    //   this.setState({employees: response.entity._embedded.employees});
    // });
    this.loadFromServer(this.state.pageSize);
  }

  // Render is the API that "draws" the component on the screen
  // <EmployeeList /> component
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
  // is not a digit, then strip that character from the input. My
  // understanding is that, due to how React works, even though intermediate
  // calls would be made to re-render the page every time a digit is entered,
  // React will wait to do batch updates. So, for instance, if you attempt to
  // modify the pageSize to be 42, it would say NEW PAGE SIZE: 4 as soon as
  // 4 is entered, but then you enter 2 and it says NEW PAGE SIZE: 42, which
  // is ultimately what is displayed.
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

    // A table generated from {employees}
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

  // this is for displaying a delete button next to the employee's information
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
  // This code is called because the code returned in the render function
  // as a <button onClick=handleSubmit> tag.
  // e is an event
  handleSubmit(e) {
    // prevent the event from bubbling up the hierarchy
    e.preventDefault();

    const newEmployee = {};
    // find all input with this attribute and supply its value to
    // newEmployee[attribute]
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
