import React, { useContext, useEffect, useState } from "react";
import { MappingConstants } from "react-cismap";
import TopicMapContextProvider from "react-cismap/contexts/TopicMapContextProvider";
import { md5FetchText } from "react-cismap/tools/fetching";
import HeavyRainHazardMap from "@cismet-dev/react-cismap-rainhazardmaps/HeavyRainHazardMap";
import EnviroMetricMap from "@cismet-dev/react-cismap-rainhazardmaps/EnviroMetricMap";
import { getGazDataForTopicIds } from "react-cismap/tools/gazetteerHelper";
import { md5FetchJSON } from "react-cismap/tools/fetching";
import GenericModalApplicationMenu from "react-cismap/topicmaps/menu/ModalApplicationMenu";
import { version as cismapRHMVersion } from "@cismet-dev/react-cismap-rainhazardmaps/meta";
import CrossTabCommunicationControl from "react-cismap/CrossTabCommunicationControl";
import CrossTabCommunicationContextProvider from "react-cismap/contexts/CrossTabCommunicationContextProvider";

import config from "./config";
import { getCollabedHelpComponentConfig } from "@cismet-collab/flooding-wupp-texts";
import { getApplicationVersion } from "./version";
import NotesDisplay from "./NotesDisplay";
import { EnviroMetricMapContext } from "@cismet-dev/react-cismap-rainhazardmaps/EnviroMetricMapContextProvider";
import StyledWMSTileLayer from "react-cismap/StyledWMSTileLayer";

function App() {
  const reactCismapRHMVersion = cismapRHMVersion;
  const version = getApplicationVersion();
  const [hochwasserschutz, setHochwasserschutz] = useState(true);

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

  useEffect(() => {
    getGazData(setGazData);
    // getHinweisData(setHinweisData, config.config.hinweisDataUrl);
  }, []);

  return (
    <CrossTabCommunicationContextProvider
      role="sync"
      token="floodingAndRainhazardSyncWupp"
    >
      <TopicMapContextProvider
        appKey={"Hochwasserkarte.Story.Wuppertal"}
        referenceSystem={MappingConstants.crs3857}
        referenceSystemDefinition={MappingConstants.proj4crs3857def}
        // baseLayerConf={wuppertalConfig.overridingBaseLayerConf}
        infoBoxPixelWidth={370}
      >
        <EnviroMetricMap
          appMenu={
            <GenericModalApplicationMenu
              {...getCollabedHelpComponentConfig({
                version,
                reactCismapRHMVersion,

                email,
              })}
            />
          }
          applicationMenuTooltipString="Anleitung | Hintergrund"
          initialState={config.initialState}
          emailaddress="hochwasser@stadt.wuppertal.de"
          config={config.config}
          homeZoom={18}
          contactButtonEnabled={false}
          homeCenter={[51.27202324060668, 7.20162372978018]}
          modeSwitcherTitle="Hochwasserkarte Wuppertal"
          documentTitle="Hochwasserkarte Wuppertal"
          gazData={gazData}
          gazetteerSearchPlaceholder="Stadtteil | Adresse | POI | GEP"
          animationEnabled={false}
          toggleEnabled={true}
          customInfoBoxToggleState={hochwasserschutz}
          customInfoBoxToggleStateSetter={setHochwasserschutz}
          customInfoBoxDerivedToggleState={(toggleState, state) =>
            state.selectedSimulation !== 2 && toggleState
          }
          customInfoBoxDerivedToggleClickable={(controlState) => {
            return controlState.selectedSimulation !== 2;
          }}
        >
          <CrossTabCommunicationControl hideWhenNoSibblingIsPresent={true} />
          <NotesDisplay />
          <SituationOhneHochwasserschutz />
        </EnviroMetricMap>
      </TopicMapContextProvider>
    </CrossTabCommunicationContextProvider>
  );
}

const SituationOhneHochwasserschutz = () => {
  const { controlState } = useContext(EnviroMetricMapContext);
  const mapConfig = config.config;
  const state = controlState;

  if (
    controlState.customInfoBoxToggleState === false &&
    mapConfig.simulations[state.selectedSimulation].gefaehrdungsLayer
  ) {
    return (
      <StyledWMSTileLayer
        key={
          "rainHazardMap.depthLayer" +
          mapConfig.simulations[state.selectedSimulation].gefaehrdungsLayer +
          "." +
          state.selectedBackground
        }
        url={mapConfig.modelWMS}
        layers={
          mapConfig.simulations[state.selectedSimulation].gefaehrdungsLayer
        }
        version="1.1.1"
        transparent="true"
        format="image/png"
        tiled="true"
        styles={mapConfig.simulations[state.selectedSimulation].depthStyle}
        maxZoom={22}
        opacity={0.8}
      />
    );
  }
  return null;
};
export default App;
