import React, {Component} from 'react';
import Particles from 'react-particles-js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Modal from './components/Modal/Modal';
import Profile from './components/Profile/Profile';
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
  isProfileOpen: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: '',
    age:'',
    pet:''
  }
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState
  }

  /*  componentDidMount() {
      fetch('http://localhost:3030/')
          .then(response => response.json())
          .then(data => console.log(data))
    }*/

  componentDidMount () {
    const token = window.sessionStorage.getItem('token');
    if(token) {
      fetch('https://damp-dusk-57532.herokuapp.com/signin', {
      // fetch('http://localhost:3001/signin', {
        method: 'post',
        headers: {
          'content-Type': 'application/json',
          'Authorization': token
        },
      })
          .then(resp => resp.json())
          .then(data => {
            if(data && data.id){
              fetch(`https://damp-dusk-57532.herokuapp.com/profile/${data.id}`, {
              // fetch(`http://localhost:3001/profile/${data.id}`, {
                method: 'get',
                headers: {
                  'content-Type': 'application/json',
                  'Authorization': token
                },
              })
                  .then(resp => resp.json())
                  .then(user => {
                    if(user && user.email){
                      this.loadUser(user);
                      this.onRouteChange('home');
                    }
                  })
            }
          })
          .catch(console.log)
    }
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
        age: data.age,
        pet: data.pet
      }
    })
  };

  calculateFaceLocations = (data) => {
    if(data && data.outputs){
      return data.outputs[0].data.regions.map(face => {
        const clarifaiFace = face.region_info.bounding_box;
        const image = document.getElementById('inputimage');
        const width = Number(image.width);
        const height = Number(image.height);
        return {
          id: face.id,
          leftCol: clarifaiFace.left_col * width,
          topRow: clarifaiFace.top_row * height,
          rightCol: width - (clarifaiFace.right_col * width),
          bottomRow: height - (clarifaiFace.bottom_row * height)
        }
      })
    }

    return;
  };

  displayFaceBoxes = (boxes) => {
    if(boxes){
      this.setState({boxes: boxes});
    }
  };

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  };

  onPictureSubmit = () => {
    const token = window.sessionStorage.getItem('token');
    this.setState({imageUrl: this.state.input});

    fetch('https://damp-dusk-57532.herokuapp.com/imageurl', {
    // fetch('http://localhost:3001/imageurl', {
      method: 'post',
      headers: {
        'content-Type': 'application/json',
        'Authorization': token},
      body: JSON.stringify({
        input: this.state.input
      })
    }).then(response => response.json())
        .then(response => {
          if (response) {
            fetch('https://damp-dusk-57532.herokuapp.com/image', {
            // fetch('http://localhost:3001/image', {
              method: 'put',
              headers: {
                'content-Type': 'application/json',
                'Authorization': token},
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
      window.sessionStorage.removeItem('token');
    } else if (route === 'home') {
      this.setState({isSignedIn: true});
      this.setState({route: route});
    } else {
      this.setState({route: route});
    }
  };

  toggleModal = () => {
    this.setState(prevState => ({
        ...this.state,
      isProfileOpen: !prevState.isProfileOpen
    }))
  }

  render() {
    const {isSignedIn, imageUrl, route, boxes, user, isProfileOpen} = this.state;
    return (
        <div className="App">
          <Particles className='particles'
                     params={particlesOptions}
          />
          <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}
                      toggleModal={this.toggleModal}/>
          {isProfileOpen &&
          <Modal>
            <Profile
                isProfileOpen={isProfileOpen}
                toggleModal={this.toggleModal}
                user={user}
                loadUser={this.loadUser}
            />
          </Modal>}
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
