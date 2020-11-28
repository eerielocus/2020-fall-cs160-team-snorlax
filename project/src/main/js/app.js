/*
 * General information about React:
 * React is driven by Components. A component is created by making a class
 * that extends React.Component.
 *
 * Helpful information can be found here:
 * https://reactjs.org/docs/react-component.html
 *
 * The only mandatory aspect of a component is render(), which is the function
 * that decides how a component is "drawn". render() has a return statement
 * that accepts JSX code, which is a hybrid of HTML and JavaScript. In the
 * return statement of render(), you can return another component, or you can
 * use a <div> element to combine multiple effects.
 *
 * React components have two types of data - state and properties
 * State is the data that the component is expected to handle itself
 *   Read state from this.state
 *   Set state with this.setState() - This will automatically call render()
 *   to properly update the component.
 *     **Important: never update state by assigning this.state outside of the
 *     constructor. Use this.setState() instead. Otherwise, you will break the
 *     React component model. Because JavaScript sucks, this is not enforced
 *     by the language. Just don't do it.
 *     **Important: this.setState() is NOT guaranteed to happen right away.
 *     You should never use this.setState() and then immediately check the
 *     state, because it is likely that the state has not changed yet. If you
 *     really need to use the state right after updating it, then pass a
 *     callback to this.setState().
 *   The convention is to initialize state with all of your attributes empty
 *   in the constructor (employees is the lone attribute in this case), and
 *   then look the data up in the server with componentDidMount to populate
 *   the attributes.
 * Properties is data that is passed into the component. Properties do not
 * change. To set them, you assign them to attributes when creating a new
 * component
 *
 * When a react component is created, the following methods will be called in
 * order:
 *   constructor()
 *   render()
 *   componentDidMount()
 *
 * When a componet updates, it calls the following methods in order:
 *   render()
 *   componentDidUpdate()
 *
 * When a component is being removed from the DOM, the following method will
 * be called:
 *   componentWillUnmount()
 *
 * render() is the only required method of a component.
 */
'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const client = require('./client');
const follow = require('./follow');
import Dropzone from 'react-dropzone';

import { BrowserRouter, Route, Switch, NavLink, useParams, Redirect }
  from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import postcardWhite from '../../../../project/postcardWhite.png';

const root = '/api';

// Route controller to the appropriate component
class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Navigation/>
        <div>
          <Switch>
            <Route path="/" component={Upload} exact />
            <Route path="/share/:key" component={Share} />
            <Route path="/test" component={Test} />
            <Route path="/testd" component={TestDynamic} />
            <Route component={Error}/>
          </Switch>
        </div>
      </BrowserRouter>
    )
  }
}


// Test a static image display
class Test extends React.Component {
  render() {
    const path = './data/images/cat.png';
    const display = <img src={path} />;

    return (
      <div>
        {display}
      </div>
    )
  }
}

// Test a dynamic image display
class TestDynamic extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url: ""
    };
  }

  componentDidMount() {
    // fetch('http://localhost:8080/api/images/test')
    fetch('http://localhost:8080/api/images/blob/1')
      .then(response => {
        console.log(response);
        response.blob().then(blob => {
          console.log(blob);
          if (blob.size != 0) {
            const url = URL.createObjectURL(blob);
            console.log(url);
            this.setState({
              url: url
            });
          }
        });
      });
  }

  render() {


    const display = <img src={this.state.url} />

    return (
      <div class="img-uploaded">
        {display}
      </div>
    )
  }
}

// Something that is correctly mapped by HomeController that fails to find
// a component routed by React Router will find this component.
class Error extends React.Component {
  render() {
    return (
      <div>
        <Navigation />
        Some error occurred!
      </div>
    )
  }
}

// Nav links to anywhere we want. Currently just a link back to the uploader.
class Navigation extends React.Component {
  render() {
    return (
      <div className='navigation'>
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand>


          <img
              src={postcardWhite}
              width="70"
              height="42"
              className="d-inline-block align-top"
              alt="Postcard logo"
            />


            Postcard
          </Navbar.Brand>

          <NavLink to="/" style={{marginLeft: '20px'}}>
            <i class="fas fa-upload"></i> Upload
          </NavLink>

        </Navbar>
      </div>
    )
  }
}

// This is our component for handling image share. It grabs the key from the
// URI assuming that the key is of the form /<key goes here> in the URI.
function Share() {
  const {key} = useParams();

  return (
    <div>
      <Image id={key} />
    </div>
  )
}

// Image component -- This should display the image, and also show other
// information like number of views and the share link.
//
// you should create this component like so:
// <Image id={someID} />
class Image extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      views: 0,
      url: ""
    }
  }

  // componentDidMount is called when a component is initially created and
  // mounted to the DOM. The goal here is to fetch our image information
  // (pertaining to the key that was given to us in props) from the server,
  // and also increment the views (because we are currently viewing this
  // image).
  componentDidMount() {
    client({
      method: 'GET',
      path: '../api/images/' + this.props.id
    }).then(response=> {
      console.log(response);
      const views = response.entity.views + 1;

      // Update views in server
      client({
        method: 'PATCH',
        path: response.entity._links.self.href,
        entity: {views: views},
        headers: {'Content-Type': 'application/json'}
      });

      // Get the blob from the server and use it to create the image URL,
      // then set the state for URL and number of views.
      fetch('http://localhost:8080/api/images/blob/' + this.props.id)
        .then(response => {
          console.log(response);
          response.blob().then(blob => {
            console.log(blob);
            if (blob.size != 0) {
              const url = URL.createObjectURL(blob);
              console.log(url);
              this.setState({
                views: views,
                url: url
              });
            }
          });
        });
    }).catch(error => {
      console.log("An error has occurred!");
      console.log(error);
    });
  }

  render() {
    const display = <img src={this.state.url} />;
    const shareURL = 'http://localhost:8080/share/' + this.props.id;

    return (
      <div class="img-uploaded">
        {display}<br />
        Views: {this.state.views}<br />
        Share URL: {shareURL}<br />
      </div>
    )
  }
}

// Upload an image to the server with a drag and drop box
class Upload extends React.Component {
  constructor(props) {
    super(props);

    // Setup state to trigger conditional render and send data
    this.state = {
      imageID: 0,
      uploaded: false,
    }

    // this is boilerplate that is necessary when a component has a helper
    // function other than one of the primary component methods.
    this.onFileDrop = this.onFileDrop.bind(this);
  }

  // When someone drops a file in, lookup their IP address, then send the
  // file information and their IP address to the server.
  onFileDrop(inputFile) {
    // get the IP address by asking this shady website what it is
    fetch("https://api.ipify.org?format=json")
      .then(response => {
        return response.json();
      }, "jsonp")

      // when we get the response, we need to prepare for uploading the file
      // to the server. We create a FormData object and append the file and
      // ip address to it. This data is accessible in our Spring backend by
      // using @RequestParam in the appropriate Controller method.
      .then(res => {
        const formData = new FormData();
        formData.append('file', inputFile[0]);
        formData.append('ip', res.ip);

        // client is our REST api object for interracting with the server. It
        // passes data through 'entity'.
        client({
          method: 'POST',
          path: '/api/images',
          entity: formData,
          headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => {
          // res.entity is the image object in JSON format
          console.log(res.entity);

          this.setState({
            imageID: res.entity.id,
            uploaded: true,
          });
        }).catch(err => console.log(err))
      }).catch(err => console.log(err));
  }

  // render a dropzone box that accepts any type of image.
  // Dropzone handles file uploads in a drag and drop style. The look can be
  // modified by changing .fileDrop in src/main/resources/static/main.css
  render() {
    // Conditional rendering flag; redirect to image url after upload
    const isUploaded = this.state.uploaded;
    const imageURL = '/share/' + this.state.imageID;

    return (
      <div id='foo'>
        <Dropzone
          accept="image/*"
          onDrop={this.onFileDrop}>
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <div className='fileDrop'>
                  Drag a file here or click to upload.
                </div>
              </div>
            </section>
          )}
        </Dropzone>
        {isUploaded && <Redirect to={imageURL} />}
      </div>
    )
  }
}

// This is the 'main' of React, in a sense. It renders the primary component,
// <App />, and looks where to inject the React code by looking for an html
// element with id='react'. If you look in
// src/main/resources/templates/index.html, you'll find where the React code
// is injected into, although detail is unimportant for actually using React.
ReactDOM.render(
  <App />,
  document.getElementById('react')
)
