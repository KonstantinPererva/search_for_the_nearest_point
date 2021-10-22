window.addEventListener('load', function () {
    if (!stores.length) { return; }
    (function (storesList) {
        let center = { lat: 49.98821775383394, lng: 36.23271625625523 };
        let form = null;
        let inputFromPlace = null;
        let resultField = null;
        let resultFieldDistance = null;
        let resultFieldDuration = null;
        let map = null;

        const initMap = () => {
            map = new google.maps.Map(document.getElementById("MyMap"),
                {
                    mapTypeControl: false,
                    center: center,
                    zoom: 12,
                }
            );

            return map;
        }

        const initForm = () => {
            form = document.getElementById('formDestination');
            inputFromPlace = document.getElementById('fromPlaces');

            resultField = document.getElementById('result');
        }

        const initAutocomplete = () => {
            return  new google.maps.places.Autocomplete(inputFromPlace, {
                componentRestrictions: { country: "ua" },
                fields: ["address_components", "geometry"],
                types: ["address"],
            });
        }

        class MarkerMap {
            constructor(map, options) {
                this.iconMarker = "/images/marker.svg";
                this.iconMarkerActive = "/images/marker-active.svg";

                this.defaultOptions =
                    {
                        position: {
                            lat: 49.990754425827014,
                            lng: 36.232603570678044
                        },
                        content: `<div> INFO MARKER </div>`,
                        icon: this.iconMarker,
                        iconActive: this.iconMarkerActive,
                        title: "Point",
                        map: map
                    };

                this.options = Object.assign(this.defaultOptions, options);

                const {position, icon, title, content} = this.options;

                this.point = new google.maps.Marker({
                    position,
                    icon,
                    title,
                    map
                });

                this.infowindow = new google.maps.InfoWindow({
                    content: this.options.content
                });

                this.handleClick (() => {this.openInfo()});

                this.active = this.active.bind(this);
                this.handleClick = this.handleClick.bind(this);
                this.openInfo = this.openInfo.bind(this);
                this.closeInfo = this.closeInfo.bind(this);
            }

            notActive() {
                this.point.setIcon(this.iconMarker);
                this.closeInfo()
            }

            active() {
                this.point.setIcon(this.iconMarkerActive);
            }

            handleClick(callback) {
                this.point.addListener('click', callback);
            }

            openInfo() {
                this.infowindow.open({
                    anchor: this.point,
                    map,
                    shouldFocus: false,
                });
            }

            closeInfo() {
                this.infowindow.close();
            }
        }

        class CardPlace {
            constructor(parent, options) {
                this.defaultOptions = {
                    telList: ['+38(099) 999 99 99', '+38(099) 999 99 99'],
                    title: 'LaMaster',
                    address: 'street',
                    workingHours: '9:00 - 20:00',
                    titleMarker: 'Point',
                    positionMarker: {
                        lat: 49.990754425827014,
                        lng: 36.232603570678044
                    },
                    contentMarker: null,
                    map: {}
                };
                this.options = Object.assign(this.defaultOptions, options);
                this.node = null;
                this.parent = parent;

                this.marker = new MarkerMap(map, {
                    title: this.options.titleMarker,
                    position: this.options.positionMarker,
                    map: this.options.map,
                    content: this.options.contentMarker
                });

                this.createEl = this.createEl.bind(this);
                this.create = this.create.bind(this);
                this.stateActive = this.stateActive.bind(this);
                this.create();
            }

            createEl(el, classList, parent) {
                let element = document.createElement(el);
                if(classList.trim() !== ''){
                    element.classList.add(classList);
                }
                parent.append(element);
                return element;
            }

            getCenterMap() {
                return this.options.map.getCenter();
            }

            create() {
                let placeCard = this.createEl('div','place-card', this.parent);
                this.node = placeCard;
                let placeCardHold = this.createEl('div','place-card__hold', placeCard);
                let placeCardLabel = this.createEl('div','place-card__label', placeCardHold);
                let placeCardAddress = this.createEl('address','place-card__address', placeCardHold);
                placeCardAddress.classList.add('address-box');
                let placeCardTitle = this.createEl('span','place-card__title', placeCardLabel);
                let placeCardTitleSpan = this.createEl('span','', placeCardTitle);
                placeCardTitleSpan.innerHTML = this.options.title; /*TODO*/// Название
                let placeCardLocal = this.createEl('span','place-card__local', placeCardLabel);
                let placeCardLocalSpan = this.createEl('span','', placeCardLocal);
                placeCardLocalSpan.innerHTML = this.options.address; /*TODO*/// Адрес
                let addressBoxItem_1 = this.createEl('div','address-box__item', placeCardAddress);
                let addressBoxItem_2 = this.createEl('div','address-box__item', placeCardAddress);
                let addressBoxIcon_1 = this.createEl('div','address-box__icon', addressBoxItem_1);
                addressBoxIcon_1.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.5547 11.5413L13.4998 9.48637C12.9069 8.8935 11.9422 8.89354 11.3494 9.48637L10.4466 10.3892C8.38472 9.3094 6.6903 7.6149 5.61055 5.55289L6.51338 4.65002C7.10618 4.05715 7.10618 3.09245 6.51338 2.49957L4.45855 0.444654C3.8657 -0.148218 2.90103 -0.148218 2.30819 0.444654L0.664315 2.08864C-0.194618 2.94757 -0.221473 4.46177 0.588679 6.35222C1.319 8.05641 2.65942 9.9332 4.36298 11.6368C6.06653 13.3404 7.94323 14.6809 9.64735 15.4113C10.5636 15.804 11.3913 16 12.099 16C12.8514 16 13.4681 15.7783 13.9107 15.3357L15.5546 13.6917C15.8419 13.4045 16 13.0227 16 12.6165C16 12.2104 15.8419 11.8285 15.5547 11.5413ZM14.6371 12.7743L12.9933 14.4182C12.5482 14.8633 11.4885 14.7887 10.1584 14.2187C8.60242 13.5518 6.87002 12.3091 5.28038 10.7193C3.69078 9.12963 2.44804 7.3972 1.78116 5.84113C1.21119 4.51107 1.13655 3.45127 1.58167 3.00617L3.22555 1.36222C3.31255 1.27525 3.45405 1.27525 3.54102 1.36222L5.59585 3.41714C5.68282 3.50411 5.68282 3.64566 5.59585 3.73259L4.03968 5.28887L4.2354 5.70205C5.49193 8.35481 7.64484 10.5079 10.2975 11.7644L10.7107 11.9601L12.2669 10.4039C12.3237 10.3471 12.3901 10.3385 12.4246 10.3385C12.4591 10.3385 12.5254 10.347 12.5823 10.4039L14.6371 12.4588C14.6939 12.5156 14.7024 12.582 14.7024 12.6165C14.7025 12.651 14.694 12.7174 14.6371 12.7743Z" fill="black"></path></svg>'; /*TODO*/// Иконка
                let addressBoxData_1 = this.createEl('div','address-box__data', addressBoxItem_1);
                for (let i = 0; i < this.options.telList.length; i++)
                {
                    let tel = this.options.telList[i];
                    let addressBoxDataA = this.createEl('a','', addressBoxData_1);
                    addressBoxDataA.innerHTML = tel; /*TODO*/// Номер телефона
                    addressBoxDataA.setAttribute('href','tel:' + tel); /*TODO*/// Номер телефона в атрибуте ссылки
                }
                let addressBoxIcon_2 = this.createEl('div','address-box__icon', addressBoxItem_2);
                addressBoxIcon_2.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 0C3.5888 0 0 3.5888 0 8C0 12.4112 3.5888 16 8 16C12.4112 16 16 12.4112 16 8C16 3.5888 12.4112 0 8 0ZM8 14.2977C4.52746 14.2977 1.7021 11.4727 1.7021 8C1.7021 4.5273 4.52746 1.70226 8 1.70226C11.4725 1.70226 14.2979 4.5273 14.2979 8C14.2979 11.4727 11.4725 14.2977 8 14.2977Z" fill="black"></path><path d="M12.1689 7.75335H8.57366V3.43058C8.57366 3.06681 8.27873 2.77188 7.91496 2.77188C7.55119 2.77188 7.25625 3.06681 7.25625 3.43058V8.41206C7.25625 8.77583 7.55119 9.07076 7.91496 9.07076H12.1689C12.5327 9.07076 12.8276 8.77583 12.8276 8.41206C12.8276 8.04828 12.5327 7.75335 12.1689 7.75335Z" fill="black"></path></svg>'; /*TODO*/// Иконка
                let addressBoxData_2 = this.createEl('div','address-box__data', addressBoxItem_2);

                if(this.options.workingHours.length){
                    let addressBoxDataSpan_1 = this.createEl('span','', addressBoxData_2);
                    addressBoxDataSpan_1.innerHTML = 'Пн-Пт с ' + this.options.workingHours[0].hours[0] + ' до ' + this.options.workingHours[0].hours[1]; /*TODO*/// Время работы

                    let addressBoxDataSpan_2 = this.createEl('span','', addressBoxData_2);
                    addressBoxDataSpan_2.innerHTML = 'Сб с ' + this.options.workingHours[5].hours[0] + ' до ' + this.options.workingHours[5].hours[1]; /*TODO*/// Время работы

                    let addressBoxDataSpan_3 = this.createEl('span','', addressBoxData_2);
                    addressBoxDataSpan_3.innerHTML = 'Вс с ' + this.options.workingHours[6].hours[0] + ' до ' + this.options.workingHours[6].hours[1]; /*TODO*/// Время работы
                }
            }

            stateActive(isCenter) {
                this.node.classList.add('active');
                this.marker.active();
                this.marker.openInfo();
                if (isCenter) {
                    this.options.map.panTo(this.options.positionMarker);
                }
                // this.options.map.setCenter({lng: +this.options.positionMarker.lng, lat: +this.options.positionMarker.lat});
            }

            setCenterAndZoom(num) {
                this.options.map.panTo(this.options.positionMarker);
                this.options.map.setZoom(+num);
            }

            stateNotActive() {
                this.node.classList.remove('active');
                this.marker.notActive();
            }
        }

        const minDistanceToPoint = (listPoint, callback) => {
            let list = [];

            for (let i = 0; i < listPoint.length; i++) {
                ( num => {
                    list.push(
                        new Promise(((resolve, reject) => {
                            let directionsService = new google.maps.DirectionsService();

                            directionsService.route({
                                origin: inputFromPlace.value,
                                destination: listPoint[num].options.positionMarker,
                                travelMode: google.maps.TravelMode.WALKING,
                                unitSystem: google.maps.UnitSystem.metric
                            }, (result, status) => {
                                if (status === google.maps.DirectionsStatus.OK) {
                                    resolve(result);
                                } else {
                                    reject((err) => console.log("Error: ", err))
                                }
                            });
                        }))
                            .then((result) => {
                                return {
                                    title: listPoint[num].options.titleMarker,
                                    destination: listPoint[num].options.positionMarker,
                                    value: result.routes[0].legs[0].distance.value,
                                    card: listPoint[num]
                                }
                            })
                    )
                })(i)
            }

            Promise.all(list).then(values => {
                let name = values[0].title;
                let min = values[0].value;
                let dest = values[0].destination;
                let card = values[0].card;

                for (let i = 0; i < values.length; i++) {
                    if (min > values[i].value) {
                        name = values[i].title;
                        dest = values[i].destination;
                        min = values[i].value;
                        card = values[i].card;
                    }
                }

                resultField.innerHTML = "Ближайшая точка - " + name;
                card.setCenterAndZoom(14);

                if(typeof callback === "function"){
                    callback(card);
                }
            });
        }

        initMap();
        initForm();
        initAutocomplete();

        let listCard = [];

        storesList.map(function (store) {
            function showTel(list) {
                let res = '';

                if (list.length) {
                    for (let i = 0; i < list.length; i++) {
                        res += '<div style="margin-bottom: 5px;">Тел: ' + list[i] + '</div>'
                    }
                }

                return res;
            }

            let card = new CardPlace(document.querySelector('.shops-box__place .place-list'),
                {
                    map: map,
                    positionMarker: { lat: store.lat, lng: store.lng },
                    title: store.name.trim() || 'LaMaster',
                    address: store.address.trim() || '- - -',
                    telList: store.phones.length ? store.phones : ['- - -'],
                    titleMarker: store.name,
                    contentMarker: `
                        <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">LaMaster</div>
                        <div style="margin-bottom: 5px;">${store.name}</div>
                        <div>
                            ${showTel(store.phones)}
                        </div>
                    `,
                    workingHours: store.work_time
                }
            );

            listCard.push(card)
        });

        function active(node, isCenter) {
            for (let j = 0; j < listCard.length; j++) {
                (listCard[j] !== node) ? listCard[j].stateNotActive() : listCard[j].stateActive(isCenter);
            }
        }

        for (let i = 0; i < listCard.length; i++) {
            listCard[i].node.addEventListener('click', () => {active(listCard[i], true)});
            listCard[i].marker.handleClick(() => {active(listCard[i])});
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            minDistanceToPoint(listCard, active);
        });
    })(stores)
})