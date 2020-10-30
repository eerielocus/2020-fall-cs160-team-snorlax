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
import Dropzone from 'react-dropzone';

import { BrowserRouter, Route, Switch, NavLink, useParams }
  from 'react-router-dom';

const imagePath = require.context('../../../data/images', true);

const root = '/api';

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Switch>
            <Route path="/" component={Upload} exact />
            <Route path="/share/:key" component={Share} />
            <Route path="/test" component={Test} />
            <Route component={Error}/>
          </Switch>
        </div>
      </BrowserRouter>
    )
  }
}

class Test extends React.Component {
  render() {
    // const someCat = './cat.png';
    // const someCat = './d9510bc7-eb40-4e7b-99c2-8b5a1ab9f009.png';
    // const catImage = imagePath(someCat, true).default;
    // const display = <img src={catImage} />;
    const path = './data/images/cat.png';
    const display = <img src={path} />;

    return (
      <div>
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
      <div>
        <NavLink to="/">Upload</NavLink>
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
      {/* {key} */}
      <Image filename={key} />
    </div>
  )
}

// Image component -- This should display the image, and also show other
// information like number of views and the share link.
//
// This component requires the image key as a prop.
//
// you should create this component like so:
// <Image key={img._links.self.href} />
//
// TODO: This needs to be tested! I have not tested this in any way.
class Image extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filename: "",
      format: "",
      uploaderIp: "",
      timestamp: 0,
      views: 0
    }
  }

  // componentDidMount is called when a component is initially created and
  // mounted to the DOM. The goal here is to fetch our image information
  // (pertaining to the key that was given to us in props) from the server,
  // and also increment the views (because we are currently viewing this
  // image).
  componentDidMount(){
    client({
      method: 'GET',
      path: '../api/images/' + this.props.filename
    }).then(response=> {
      console.log(response);
      const newState = {
        format: response.entity.format,
        uploaderIp: response.entity.uploaderIp,
        timestamp: response.entity.timestamp,
        views: response.entity.views + 1 // increment views
      };

      console.log(newState);

      // update views in server
      // this could be done with PATCH, but I think it requires more work
      client({
        method: 'PUT',
        path: response.entity._links.self.href,
        entity: newState,
        headers: {'Content-Type': 'application/json'}
      });

      return newState;

    }).done(newState => {
      // update our own state, which triggers a new render
      this.setState(newState);
    });
  }

  render() {
    var display;
    if (this.state.format !== "") {
      // const filePath = "./" + this.props.filename + "." + this.state.format;
      // const imageSrc = imagePath(filePath, true).default;
      const imageSrc = '../'
        + this.props.filename + "."
        + "png";
      display = <img src={imageSrc} />;
    } else {
      display = "";
    }

    // const catImage = imagePath('./cat.png', true).default;

    return (
      <div>
        {display}
      </div>
    )
  }
}

// Upload an image to the server with a drag and drop box
class Upload extends React.Component {
  constructor(props) {
    super(props);

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
        console.log(inputFile);
        console.log(res.ip);

        // client is our REST api object for interracting with the server. It
        // passes data through 'entity'.
        client({
          method: 'POST',
          path: '/api/images',
          entity: formData,
          headers: {'Content-Type': 'multipart/form-data'}
        }).then(res => {
          // res.entity is the image object in JSON format
          console.log(res.entity);

          // this is just for handy feedback. I expect that we won't have
          // such an annoying feature in the finished product.
          alert("File uploaded successfully.");
        }).catch(err => console.log(err))
      }).catch(err => console.log(err));
  }

  // render a dropzone box that accepts any type of image.
  // Dropzone handles file uploads in a drag and drop style. The look can be
  // modified by changing .fileDrop in src/main/resources/static/main.css
  render() {
    return(
      <Dropzone
        accept="image/*"
        onDrop={this.onFileDrop}>
        {({getRootProps, getInputProps}) => (
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
