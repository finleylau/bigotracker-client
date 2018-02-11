import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import camelize from '../services/camelize';
import evtNames from '../services/mapEventNames';

export default class Map extends React.Component {
  constructor(props) {
    super(props);

    const {lat,lng} = this.props.initialCenter;
    this.state = {
      currentLocation: {
        lat: lat,
        lng: lng
      }
    }
  }

  handleEvent(evtName) {
    let timeout;
    const handlerName = `on${camelize(evtName)}`;

    return (e) => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      timeout = setTimeout(() => {
        if (this.props[handlerName]) {
          this.props[handlerName](this.props, this.map, e);
        }
      }, 0);
    }
  }

  componentDidMount() {
    // if center around location
    if (this.props.centerAroundCurrentLocation) {
      if (navigator && navigator.geolocation) {
        // get the location and update state
        navigator.geolocation.getCurrentPosition((pos) => {
          const coords = pos.coords;
          this.setState({
            currentLocation: {
              lat: coords.latitude,
              lng: coords.longitude
            }
          })
        })
      }
    }

    this.loadMap();
  }

  componentDidUpdate(prevProps, prevState) {
    // see if the map is changed
    if (prevProps.google !== this.props.google) {
      this.loadMap();
    }
    // check if the center  of the map has changed
    if (prevState.currentLocation !== this.state.currentLocation) {
      this.recenterMap();
    }

    if (prevProps.map !== this.props.map) {
      this.renderAutoComplete();

      // get reports
      this.props.getReports()
    }
  }

  renderAutoComplete() {
    const map = this.map, google = this.props.google;
    if (!google || !map) return;

    // get the text field
    const aref = this.refs.autocomplete;
    const node = ReactDOM.findDOMNode(aref);
    var autocomplete = new google.maps.places.Autocomplete(node);
    autocomplete.bindTo('bounds', map);

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        return;
      }
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
      }




      this.setState({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      })
    })
  }

  // move the map to point to the  new location
  recenterMap() {
    if (!this.props.google || !this.map) return;

    const map = this.map;
    const curr = this.state.currentLocation;

    const google = this.props.google;
    const maps = google.maps;

    if (map) {
      let center = new maps.LatLng(curr.lat, curr.lng);
      map.panTo(center);
    }

  }

  // load the google map
  loadMap() {
    if (this.props && this.props.google) {

      // make sure that google is available
      const {google} = this.props;
      const maps = google.maps;

      // get a reference to the DOM node
      const mapRef = this.refs.map;
      const node = ReactDOM.findDOMNode(mapRef);

      // get the api request
      let {initialCenter, zoom} = this.props;
      const {lat, lng} = this.state.currentLocation;
      const center = new maps.LatLng(lat, lng);
      const mapConfig = Object.assign({}, {
        center: center,
        zoom: zoom
      })
      this.map = new maps.Map(node, mapConfig);

      // add event listeners

      evtNames.forEach(e => {
        this.map.addListener(e, this.handleEvent(e));
      });

      evtNames.forEach(e => Map.propTypes[camelize(e)] = PropTypes.func)

      maps.event.trigger(this.map, 'ready');

      this.renderAutoComplete()
      this.forceUpdate();
    }
  }

  renderChildren() {
      const {children} = this.props;

      if (!children) return;

      var result = React.Children.map(this.props.children, c => {
        return React.cloneElement(c, {
          map: this.map,
          google: this.props.google,
          mapCenter: this.state.currentLocation
        });
      });
      return result;
  }

  render() {
    const styles = {
      mapDiv: {
        height: '100%',
        width: '100%'
      },
      searchForm: {
        position: 'absolute',
        top: '25px',
        zIndex: '10000',
        width: '100%'
      },
      formGroup: {
        display: 'flex',
        justifyContent: 'center'
      },
      searchInput: {
        width: '40%'
      }
    }

    return (
      <div style={styles.mapDiv}>
        <form onSubmit={this.onSubmit} style={styles.searchForm}>
          <div style={styles.formGroup}>
          <input
            style={styles.searchInput}
            ref="autocomplete"
            type="text"
            placeholder="Search for a place..." />
          </div>
        </form>
        <div style={styles.mapDiv} ref='map'>
          Loading map...
          {this.renderChildren()}
        </div>
      </div>
    )
  }
}

// Map component prop types
Map.propTypes = {
  google: PropTypes.object,
  zoom: PropTypes.number,
  initialCenter: PropTypes.object,
  centerAroundCurrentLocation: PropTypes.bool,
  onMove: PropTypes.func
}

// default values for prop
Map.defaultProps = {
  zoom: 15,
  initialCenter: {
    lat: 37.8,
    lng: -122.42
  },
  centerAroundCurrentLocation: true,
  onMove: function() {}
}
