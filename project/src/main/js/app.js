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

const root = '/api';

// For now, just ask for the upload.
class App extends React.Component {
  render() {
    return (
      <Upload />
    )
  }
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
      ip: "",
      timestamp: 0,
      views: 0
    }
  }

  componentDidMount(){
    client({
      method: 'GET',
      path: this.props.key
    }).done(response=> {
      const newState = {
        filename: response.entity.filename,
        format: response.entity.format,
        ip: response.entity.ip,
        timestamp: response.entity.timestamp,
        views: response.entity.views + 1 // increment views
      };

      // update our own state, which triggers a new render
      this.setState(newState);

      // update views in server
      // this could be done with PATCH, but I think it requires more work
      client({
        method: 'PUT',
        path: response.entity._links.self.href,
        entity: newState,
        headers: {'Content-Type': 'application/json'}
      });

    })
  }

  render() {
    // These props need to be set when the component is created (see example
    // above).
    const path = "data/images/"
      + this.state.filename + "."
      + this.state.format;

    return (
      <img src={path}/>
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
          path: '/api/upload',
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
