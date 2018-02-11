import React from 'react';
import {GoogleApiWrapper} from 'google-maps-react';
import Map from './Map';
import Marker from './Marker';
import InfoWindow from './InfoWindow';
import ReactDOM from 'react-dom';
import axios from 'axios';

export class Container extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {},
      reports: this.getReports()
    }

  }

  getReports() {
    axios.get(`http://localhost:5000/reports`).then(res => {
      return res.data
    })
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

    return (
      <div>
        <div style={styles.mapDiv}>
          <Map
            google={this.props.google}
            onClick={this.onMapClick.bind(this)}
            onDragend={this.onMapDragend.bind(this)}
            getReports={this.getReports.bind(this)}
            >

            {
              this.state.reports ?
              this.state.reports.map(report => {
              var pos = {lat: report.lat, lng: report.lng}
              return (
                <Marker
                  key={report.id}
                  position={pos}
                  onClick={this.onMarkerClick.bind(this)}
                  />
                )
              }) : <div></div>
            }

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
