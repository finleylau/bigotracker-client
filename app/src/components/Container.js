import React from 'react';
import {GoogleApiWrapper} from 'google-maps-react';
import Map from './Map';
import Marker from './Marker';
import InfoWindow from './InfoWindow';
import ReactDOM from 'react-dom';

export class Container extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {}
    }

  }

  onMarkerClick(props, marker, e) {
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });
  }

  onMapClick() {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      });
    }
  }

  onMapDragend() {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      });
    }
  }

  onInfoWindowClose() {
    this.setState({
      showingInfoWindow: false,
      activeMarker: null
    });
  }

  onSubmit(e) {
    e.preventDefault();
  }


  render() {
    const styles = {
      mapDiv: {
        height: '100vh',
        width: '100vw'
      }
    }
    const pos = {lat: 37.759703, lng: -122.428093}

    return (
      <div>
        <div style={styles.mapDiv}>
          <Map
            google={this.props.google}
            onClick={this.onMapClick.bind(this)}
            onDragend={this.onMapDragend.bind(this)}
            >

            <Marker
              position={pos}
              onClick={this.onMarkerClick.bind(this)}
              name={"Dolores Park"}
              />

            <InfoWindow
              marker={this.state.activeMarker}
              visible={this.state.showingInfoWindow}
              onClose={this.onInfoWindowClose}>
              <div>
                <h1>{this.state.selectedPlace.name}</h1>
              </div>
            </InfoWindow>

          </Map>
        </div>
      </div>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyAyesbQMyKVVbBgKVi2g6VX7mop2z96jBo',
  libraries: ['places']
})(Container)
