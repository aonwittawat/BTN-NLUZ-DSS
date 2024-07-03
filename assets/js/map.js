require([
    "esri/WebMap",
    "esri/views/MapView",
    "esri/widgets/LayerList",
    "esri/widgets/Slider",
    "esri/widgets/Expand",
    "esri/widgets/Popup",
    "esri/widgets/Home",
    "esri/widgets/Search",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Legend",
    "esri/core/reactiveUtils",
    "esri/config"
], function (WebMap, MapView, LayerList, Slider, Expand, Popup, Home, Search, BasemapGallery, Legend, reactiveUtils, esriConfig) {
    esriConfig.portalUrl = "https://unosat-geodrr.cern.ch/portal";
    const webmapId = new URLSearchParams(window.location.search).get("webmap") ?? "4798e5e3f65a40868ae98435106ae209";

    const map = new WebMap({
        portalItem: {
            id: webmapId
        }
    });

    const view = new MapView({
        map,
        container: "view-container"
    });

    // HOME //
    const home = new Home({view});
    view.ui.add(home, {position: 'top-left', index: 1});

    // SEARCH //
    const search = new Search({view: view});
    const searchExpand = new Expand({view: view, content: search, expandTooltip: 'Search'});
    view.ui.add(searchExpand, {position: 'top-left', index: 0});

    // BASEMAP GALLERY //
    const basemapGallery = new BasemapGallery({
    view: view,
    container: document.createElement("div")
    });
    const bgExpand = new Expand({
    view: view,
    content: basemapGallery
    });
    view.ui.add(bgExpand, "top-left");
    
    const legend = new Legend({
        view: view,
    });

    const legendExpand = new Expand({
        expandIcon: "legend",
        view: view,
        content: legend,
        expanded: true,
        visible: true
    });
    view.ui.add(legendExpand, "bottom-left");

    // LAYER LIST //
    const layerList = new LayerList({
        view: view,
        dragEnabled: false,
        visibilityAppearance: "checkbox",
        container: "layers-container",
        // https://developers.arcgis.com/javascript/latest/sample-code/widgets-layerlist-actions/
        listItemCreatedFunction: evt => {

            const item = evt.item;
            // const layersToHide = [
            // 'Transportation',
            // 'Trading Centres',
            // ];

            // if (layersToHide.includes(item.layer.title)) {
            //     item.layer.listMode = "hide";
            // }

            if (item.children.length == 0) {
                // item.actionsSections = [[{ id: "layer-details", title: "Download data...", className: "esri-icon-download" }]];

                const slider = new Slider({
                    min: 0,
                    max: 1,
                    precision: 2,
                    values: [1],
                    steps: [0, 0.25, 0.5, 0.75, 1],
                    snapOnClickEnabled: true,
                    tickConfigs: [{
                        mode: "position",
                        values: [0, 0.25, 0.5, 0.75, 1],
                        labelsVisible: false
                    }],
                    visibleElements: {
                        labels: false,
                        rangeLabels: true
                    }
                });

                // item.panel = { content: "legend", open: item.layer.visible };
                item.panel = {
                    content: slider,
                    icon: "sliders-horizontal",
                    title: "Change layer opacity",
                    open: false
                };

                slider.on("thumb-drag", (event) => {
                    const { value } = event;
                    item.layer.opacity = value;
                });

            }

        }
    });

    // MAP LOADER //
    view.ui.add("map-loader", { position: "bottom-right", index: 0 });

    // MODALS //
    const appDetailModalBtn = document.getElementById("app-details-action");
    const appDetailModalEl = document.getElementById("app-details-modal");
    appDetailModalBtn.addEventListener("click", () => { appDetailModalEl.open = !appDetailModalEl.open });

    map.when(() => {
        const { title, snippet, description } = map.portalItem;
        const navLogo = document.querySelector('calcite-navigation-logo[slot="logo"]');
        navLogo.setAttribute('heading', title);
        navLogo.setAttribute('description', snippet);
        document.querySelectorAll('.application-description').forEach(node => { node.innerHTML = description });

        // HIDE APP LOADER //
        document.getElementById("app-loader").toggleAttribute("hidden", true);

        // VIEW LOADING INDICATOR //
        reactiveUtils.watch(() => view.updating, (updating) => {
            document.getElementById("map-loader").toggleAttribute("hidden", !updating);
        });

    });
});