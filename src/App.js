import React, { useEffect, useState } from "react";
import { MappingConstants } from "react-cismap";
import TopicMapContextProvider from "react-cismap/contexts/TopicMapContextProvider";
import { md5FetchText } from "react-cismap/tools/fetching";
import HeavyRainHazardMap from "@cismet-dev/react-cismap-rainhazardmaps/HeavyRainHazardMap";
import { getGazDataForTopicIds } from "react-cismap/tools/gazetteerHelper";
import { md5FetchJSON } from "react-cismap/tools/fetching";
import GenericModalApplicationMenu from "react-cismap/topicmaps/menu/ModalApplicationMenu";
import { version as cismapRHMVersion } from "@cismet-dev/react-cismap-rainhazardmaps/meta";
import CrossTabCommunicationControl from "react-cismap/CrossTabCommunicationControl";
import CrossTabCommunicationContextProvider from "react-cismap/contexts/CrossTabCommunicationContextProvider";

import config from "./config";
import { getCollabedHelpComponentConfig } from "@cismet-collab/flooding-wupp-texts";
import { getApplicationVersion } from "./version";

function App() {
  const reactCismapRHMVersion = cismapRHMVersion;
  const version = getApplicationVersion();

  const email = "hochwasser@stadt.wuppertal.de";
  const [gazData, setGazData] = useState([]);
  const [hinweisData, setHinweisData] = useState([]);

  const getGazData = async (setData) => {
    const prefix = "GazDataForHochwasserkarteByCismet";
    const sources = {};

    sources.geps = await md5FetchText(
      prefix,
      "https://wunda-geoportal.cismet.de/data/3857/geps.json"
    );
    sources.geps_reverse = await md5FetchText(
      prefix,
      "https://wunda-geoportal.cismet.de/data/3857/geps_reverse.json"
    );
    sources.adressen = await md5FetchText(
      prefix,
      "https://wunda-geoportal.cismet.de/data/3857/adressen.json"
    );
    sources.bezirke = await md5FetchText(
      prefix,
      "https://wunda-geoportal.cismet.de/data/3857/bezirke.json"
    );
    sources.quartiere = await md5FetchText(
      prefix,
      "https://wunda-geoportal.cismet.de/data/3857/quartiere.json"
    );
    sources.pois = await md5FetchText(
      prefix,
      "https://wunda-geoportal.cismet.de/data/3857/pois.json"
    );
    sources.kitas = await md5FetchText(
      prefix,
      "https://wunda-geoportal.cismet.de/data/3857/kitas.json"
    );

    const gazData = getGazDataForTopicIds(sources, [
      "geps",
      "geps_reverse",
      "pois",
      "kitas",
      "quartiere",
      "bezirke",
      "adressen",
    ]);

    setData(gazData);
  };

  // const getHinweisData = async (setHinweisData, url) => {
  //   const prefix = "HinweisDataForHochwasserkarteByCismet";
  //   const data = await md5FetchJSON(prefix, url);

  //   const features = [];
  //   let id = 1;
  //   for (const d of data) {
  //     features.push({
  //       type: "Feature",
  //       id: id++,
  //       properties: d,
  //       geometry: d.geojson,
  //       crs: {
  //         type: "name",
  //         properties: {
  //           name: "urn:ogc:def:crs:EPSG::25832",
  //         },
  //       },
  //     });
  //   }
  //   console.log("yy hinweisData", features);

  //   setHinweisData(features || []);
  // };

  useEffect(() => {
    getGazData(setGazData);
    // getHinweisData(setHinweisData, config.config.hinweisDataUrl);
  }, []);

  return (
    <CrossTabCommunicationContextProvider>
      <TopicMapContextProvider
        appKey={"cismetRainhazardMap.Wuppertal"}
        referenceSystem={MappingConstants.crs3857}
        referenceSystemDefinition={MappingConstants.proj4crs3857def}
        infoBoxPixelWidth={370}
      >
        <HeavyRainHazardMap
          applicationMenuTooltipString="Anleitung | Hintergrund"
          appMenu={
            <GenericModalApplicationMenu
              {...getCollabedHelpComponentConfig({
                version,
                reactCismapRHMVersion,

                email,
              })}
            />
          }
          gazetteerSearchPlaceholder="Stadtteil | Adresse | POI | GEP"
          emailaddress={email}
          initialState={config.initialState}
          config={config.config}
          homeZoom={18}
          homeCenter={[51.27202324060668, 7.20162372978018]}
          modeSwitcherTitle="TopicMap Hochwasser"
          documentTitle="TopicMap Hochwasser Wuppertal"
          gazData={gazData}
        >
          <CrossTabCommunicationControl />
          {/* <NotesDisplay hinweisData={hinweisData} /> */}
        </HeavyRainHazardMap>
      </TopicMapContextProvider>
    </CrossTabCommunicationContextProvider>
  );
}

export default App;
