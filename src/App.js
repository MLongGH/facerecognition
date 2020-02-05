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
  boxes: [],
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
      boxes: [],
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

  calculateFaceLocations = (data) => {
    return data.outputs[0].data.regions.map(face => {
      const clarifaiFace = face.region_info.bounding_box;
      const image = document.getElementById('inputimage');
      const width = Number(image.width);
      const height = Number(image.height);
      return {
        id:face.id,
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - (clarifaiFace.right_col * width),
        bottomRow: height - (clarifaiFace.bottom_row * height)
      }
    })

  };

  displayFaceBoxes = (boxes) => {
    this.setState({boxes: boxes});
  };

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  };

  onPictureSubmit = () => {
    this.setState({imageUrl: this.state.input});

    fetch('http://localhost:3030/imageurl', {
      method: 'post',
      headers: {'content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    }).then(response => response.json())
        .then(response => {
          if (response) {
            fetch('http://localhost:3030/image', {
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
          this.displayFaceBoxes(this.calculateFaceLocations(response))
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
    const {isSignedIn, imageUrl, route, boxes, user} = this.state;
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
                <FaceRecognition boxes={boxes} imageUrl={imageUrl}/>
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
