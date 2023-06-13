import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Feature from 'ol/Feature.js';
import Map from 'ol/Map';
import View from 'ol/View';
import { Geometry } from 'ol/geom';
import Point from 'ol/geom/Point';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import { Subject } from 'rxjs';

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

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'openlayers-test-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  units$ = new Subject<Unit[]>();
  private vectorSource = new VectorSource();
  private vectorLayer = new VectorLayer({ source: this.vectorSource });
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
  });

  ngOnInit(): void {
    this.setMapTarget();
    this.connectWS();
    this.subscribeToUnits();
  }

  private setMapTarget(): void {
    this.map.setTarget('ol-map');
  }

  private connectWS(): void {
    const connectionWS = new WebSocket('ws://localhost:4300');
    connectionWS.onopen = () => console.log('client: connected');
    connectionWS.onmessage = (message) => {
      console.log('client: units received');
      this.units$.next(JSON.parse(message.data) as Unit[]);
    };
  }

  private createFeature(unit: Unit): Feature<Point> {
    switch (unit.type) {
      case 'human': {
        return new Feature({
          geometry: new Point([unit.position[0], unit.position[1]]),
          name: unit.fio,
          style: new Style({
            image: new Icon({
              src: 'assets/human.svg',
              width: 24,
              height: 24,
            }),
          }),
        });
      }

      case 'vehicle': {
        return new Feature({
          geometry: new Point([unit.position[0], unit.position[1]]),
          name: unit.name,
          style: new Style({
            image: new Icon({
              src: 'assets/vehicle.svg',
              width: 24,
              height: 24,
            }),
          }),
        });
      }
    }
  }

  private subscribeToUnits(): void {
    this.units$.subscribe((units) => {
      units.forEach((unit) => {
        const currentFeature = this.vectorSource.getFeatureById(unit.id);

        if (currentFeature) {
          console.log('update positions');
          this.setExistingFeaturePosition(
            currentFeature,
            unit.position[0],
            unit.position[1]
          );
        } else {
          console.log('create features');
          this.createNewFeature(unit);
        }
        console.log(unit);
      });
    });
  }

  private setExistingFeaturePosition(
    feature: Feature<Geometry>,
    x: number,
    y: number
  ): void {
    feature.setGeometry(new Point([x, y]));
  }

  private createNewFeature(unit: Unit): void {
    const feature = this.createFeature(unit);
    feature.setId(unit.id);
    this.vectorSource.addFeature(feature);
  }
}
