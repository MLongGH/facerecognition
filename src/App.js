import React, {Component} from 'react';
import Particles from 'react-particles-js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';

const particlesOptions = {
  particles: {
    /*    line_linked: {
          shadow: {
            enable: true,
            color: "#3CA9D1",
            blur: 5
          }
        }
      },*/
    number: {
      value: 130,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  /*  componentDidMount() {
      fetch('http://localhost:3030/')
          .then(response => response.json())
          .then(data => console.log(data))
    }*/

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  };

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  };

  displayFaceBox = (box) => {
    this.setState({box: box});
  };

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  };

  onPictureSubmit = () => {
    this.setState({imageUrl: this.state.input});
    // const API_URL = process.env.NODE_ENV === 'production'?
    //     process.env.REACT_APP_API_URL_PROD : process.env.REACT_APP_API_URL_DEV;

    fetch('https://pacific-fjord-17840.herokuapp.com/imageurl', {
      method: 'post',
      headers: {'content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    }).then(response => response.json())
      .then(response => {
        if (response) {
          fetch('https://pacific-fjord-17840.herokuapp.com/image', {
            method: 'put',
            headers: {'content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
              .then(count => count.json())
              .then(count => {
                this.setState(Object.assign(this.state.user, {entries: count}))
              })
              .catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
        .catch(err => console.log(err));
  };

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true});
      this.setState({route: route});
    } else {
      this.setState({route: route});
    }
  };

  render() {
    const {isSignedIn, imageUrl, route, box, user} = this.state;
    return (
        <div className="App">
          <Particles className='particles'
                     params={particlesOptions}
          />
          <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
          {route === 'home'
              ? <div>
                <Logo/>
                <Rank name={user.name} entries={user.entries}/>
                <ImageLinkForm
                    onInputChange={this.onInputChange}
                    onPictureSubmit={this.onPictureSubmit}
                />
                <FaceRecognition box={box} imageUrl={imageUrl}/>
              </div>
              : (route === 'signin'
                  ? <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
                  : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>)
          }
        </div>
    );
  }
}

export default App;
