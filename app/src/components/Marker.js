import React from 'react';
import PropTypes from 'prop-types';
import camelize from '../services/camelize';
import evtNames from '../services/markerEventNames';

export default class Marker extends React.Component {

  handleEvent(evtName) {
    return (e) => {
      const handlerName = `on${camelize(evtName)}`
      if (this.props[handlerName]) {
        this.props[handlerName](this.props, this.marker, e);
      }
    }
  }

  componentDidUpdate(prevProps) {
    if ((this.props.map !== prevProps.map) || (this.props.position !== prevProps.position)) {
      this.renderMarker();
    }
  }

  componentWillUnmount() {
    if (this.marker) {
      this.marker.setMap(null);
    }
  }

  renderMarker() {
    let {
      map, google, position, mapCenter
    } = this.props;

    // initialize the position
    let pos = position || mapCenter;
    position = new google.maps.LatLng(pos.lat, pos.lng);
    // create the marker
    const pref = {
      map: map,
      position: position
    };
    this.marker = new google.maps.Marker(pref);

    // handle events
    evtNames.forEach(e => {
      this.marker.addListener(e, this.handleEvent(e));
    });
  }

  render() {
    return null;
  }
}

Marker.propTypes = {
  position: PropTypes.object,
  map: PropTypes.object
}
