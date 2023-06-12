import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import Feature from 'ol/Feature.js';
import Map from 'ol/Map';
import View from 'ol/View';
import Point from 'ol/geom/Point';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import { EMPTY, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

interface Unit {
  id: string;
  type: 'human' | 'vehicle';
  fio?: string;
  name?: string;
  action: string;
  strongestNode: string;
  timestamp: Date;
  position: [number, number];
}

const humanIcon = new Feature({
  geometry: new Point([100, 0]),
  name: 'Human',
});
const humanIconStyle = new Style({
  image: new Icon({
    src: 'assets/human.svg',
    width: 24,
    height: 24,
  }),
});
humanIcon.setStyle(humanIconStyle);

const vehicleIcon = new Feature({
  geometry: new Point([0, 50]),
  name: 'Vehicle',
});
const vehicleIconStyle = new Style({
  image: new Icon({
    src: 'assets/vehicle.svg',
    width: 24,
    height: 24,
  }),
});
vehicleIcon.setStyle(vehicleIconStyle);

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'openlayers-test-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private units$ = new Subject<Unit[]>();
  private vectorSource = new VectorSource();
  private vectorLayer = new VectorLayer();
  private map = new Map({
    view: new View({
      // EPSG:4326 == WGS84
      projection: 'EPSG:4326',
      center: [0, 0],
      zoom: 2,
    }),
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
      this.vectorLayer,
    ],
    target: 'ol-map',
  });

  ngOnInit(): void {
    this.vectorLayer.setSource(this.vectorSource);
    this.connectWS();
    this.units$.subscribe((units) => {
      units.forEach((unit) => {
        const featureIcon = new Feature({
          geometry: new Point([100, 0]),
          name: 'Human',
          style: new Style({
            image: new Icon({
              src: 'assets/human.svg',
              width: 24,
              height: 24,
            }),
          }),
        });
        this.vectorSource.addFeature(featureIcon);
      });
    });
  }

  private connectWS(): void {
    const connectionWS = new WebSocket('ws://localhost:4300');
    connectionWS.onopen = () => console.log('client: connected');
    connectionWS.onmessage = (message) => {
      console.log('client: units received');
      this.units$.next(JSON.parse(message.data) as Unit[]);
    };
  }
}
