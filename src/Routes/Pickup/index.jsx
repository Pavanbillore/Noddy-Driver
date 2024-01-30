import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  FlatList,
  BackHandler,
  ActivityIndicator,
  Dimensions,
  Modal,
  Image,
} from 'react-native';
import Styles from './Pickup.styles';
import Constants from '../../Variables/colors.variables';
import { useNavigate, useLocation } from 'react-router-native';
import BreadCrumbs from '../../Components/Shared/BreadCrumbsWithSearch';
import { AppContext } from '../../Context/App.context';
import axios from 'axios';
import { API_DOMAIN } from '../../Variables/globals.variables';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationContext } from '../../Context/Notification.context';
import moment from 'moment';
import Copy from '../../Assets/Images/copy.png';
import Clipboard from '@react-native-clipboard/clipboard';
import MapView, { Polyline, Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
const Pickup = () => {
  const navigate = useNavigate();
  const queryParams = useLocation();
  const session = useContext(AppContext);
  const notification = useContext(NotificationContext);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [searchText, setSearchText] = useState(undefined);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [apiCallDone, setApiCallDone] = useState(false);
  const [buttons, setButtons] = useState([]);
  // const [locations, setlocations] = useState([]);
  const { width, height } = Dimensions.get('window');
  const GOOGLE_KEY = 'AIzaSyCV50u9d5UHeWrx9WCKD2jf1kU1q12S9Ls';
  const [pincodemodal, setpincodemodal] = useState(false);
  const [loading, setloading] = useState(false);
  const [locations, setlocations] = useState([]);
  const [selocations, setselocations] = useState([]);
  const [allPincodeOrders, setAllPincodeOrders] = useState([]);
  useEffect(() => {
    getPickups();
    BackHandler.removeEventListener('hardwareBackPress');
  }, []);
  useEffect(() => {
    if (!session) {
      return;
    }

    const back = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => back.remove();
  }, [session]);
  const backAction = async () => {
    navigate('/dashboard');
    return true;
  };
  useEffect(() => {
    setTimeout(() => {
      getPickups();
    }, 1500);
  }, []);
  const getPickups = async () => {
    try {
      session.setIsLoading(true);
      const token = await AsyncStorage.getItem('authData');
      const res = await axios.get(`${API_DOMAIN}/api/v1/pickup-list`, {
        headers: {
          authorization: `Bearer ${JSON.parse(token).token}`,
        },
      });

      if (res?.data) {
        console.log('pickup list data', res.data.detail[0]);
        setOrders(res.data.detail);
        // setlocations([]);
        // if (res.data.detail.length > 20) {
        //   setlatlng(res.data.detail.slice(0, 20));
        // } else {
        //   setlatlng(res.data.detail);
        // }
        if (queryParams.search && queryParams.search != '') {
          const index = queryParams.search.replace('?', '');
          if (orders && orders.length > index) {
            setCurrentIndex(index);
          } else {
            setCurrentIndex(orders.length - 1);
          }
        }
        var p = [];
        res.data.detail.forEach(e => {
          if (p.indexOf(e.pickup_pincode) < 0) {
            p.push(e.pickup_pincode);
          }
        });
        setlocations(p);
        setAllPincodeOrders(res.data.detail);
        setAllOrders(res.data.detail);
        session.setIsLoading(false);
        // setApiCallDone(true);
      }
    } catch (error) {
      session.setIsLoading(false);
      if (error.response) {
        let firstError =
          Object.values(error.response.data) &&
          Object.values(error.response.data)[0] &&
          Object.values(error.response.data)[0][0];
        if (firstError) {
          return notification.setNotificationObject({
            type: 'error',
            message: firstError,
          });
        }
      }
      return notification.setNotificationObject({
        type: 'error',
        message: error,
      });
    }
  };
  useEffect(() => {
    getPickData();
  }, []);
  const getPickData = async () => {
    try {
      const token = await AsyncStorage.getItem('authData');
      const res = await axios.get(
        `${API_DOMAIN}/api/v1/order-detail/${params.id}`,
        {
          headers: {
            authorization: `Bearer ${JSON.parse(token).token}`,
          },
        },
      );
      if (res?.data) {
        setButtons(res.data.detail.button);
        console.log('res', res.data.detail[0]);
        session.setForwardOrderDetails(res.data.detail);
      }
    } catch (error) {}
  };

  // const handleFilter = () => {
  //   setOrders(allOrders.filter(obj => obj.order_id === searchText));
  // };
  const handleFilter = () => {
    setOrders(allPincodeOrders.filter(obj => obj.order_id.indexOf(searchText)));
  };
  const getItemLayout = (data, index) => ({
    length: 150,
    offset: 150 * index,
    index,
  });
  const [distance, setdistance] = useState(0);
  const [duration, setduration] = useState(0);
  const [origin, setorigin] = useState();
  const [destination, setdestination] = useState();
  // const [region, setregion] = useState({

  //   latitude: 37.78825,
  //   longitude: -122.4324,
  //   latitudeDelta: 0.0922,
  //   longitudeDelta: 0.0421,
  // });
  // const fetchaddress = () => {
  //   Geolocation.getCurrentPosition(info => {
  //     var g = info.coords;
  //     setregion({
  //       latitude: g.latitude,
  //       longitude: g.longitude,
  //       latitudeDelta: 0.0922,
  //       longitudeDelta: 0.0421,
  //     });
  //   });
  // };
  // const [coordinate, setCoordinate] = useState([
  //   {
  //     latitude: 51.5115,
  //     longitude: 10.116,
  //   },
  //   {
  //     latitude: 51.521515,
  //     longitude: -0.127636,
  //   },
  // ]);

  // const setlatlng = address => {
  //   address.forEach(async e => {
  //     await getlatlongfromaddress(
  //       e.pickup_address_line_2 + ' ' + e.pickup_city + ' ' + e.pickup_pincode,
  //     );
  //   });
  // };
  // const getlatlongfromaddress = address => {
  //   return new Promise((resolve, reject) => {
  //     const url = `https://maps.googleapis.com/maps/api/geocode/json?key=${GOOGLE_KEY}&address=${address}&sensor=true`;
  //     fetch(url)
  //       .then(res => res.json())
  //       .then(resJson => {
  //         var loc = locations;
  //         if (resJson.results && resJson.results.length > 0) {
  //           var res = resJson.results[0].geometry;
  //           if (res) {
  //             loc.push({
  //               latitude: res.location.lat,
  //               longitude: res.location.lng,
  //             });
  //             setlocations(loc);
  //           }
  //         }
  //       })
  //       .catch(e => {
  //         reject(e);
  //       });
  //   });
  // };
  const copyToClipboard = d => {
    Clipboard.setString(d);
    notification.setNotificationObject({
      type: 'success',
      message: 'copied',
    });
    console.log(d);
  };
  return (
    <>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <BreadCrumbs
        title="Pickup"
        showSearchIcon
        value={searchText}
        onChange={setSearchText}
        onPress={() => {
          navigate('/dashboard');
        }}
        handleSearch={() => handleFilter()}
        onpincode={() => {
          setpincodemodal(true);
          console.log('10');
        }}
      />
      {/*   {apiCallDone && locations.length > 0 && ( */}

      {/* <MapView
            onRegionChangeComplete={region => {}}
            style={Styles.map}
            showsUserLocation={false}
            followUserLocation={true}
            zoomEnabled={true}
            initialRegion={{
              latitude: locations[0].latitude,
              longitude: locations[0].longitude,
              latitudeDelta: 2.0922,
              longitudeDelta: 2.0421,
            }}
            region={{
              latitude: locations[0].latitude,
              longitude: locations[0].longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            userLocationPriority={'high'}
            showsMyLocationButton={true}
            showsCompass={true}>
            {locations.length > 0 &&
              locations.map((data, index) => {
                return (
                  <Marker
                    key={index}
                    pinColor={'red'}
                    coordinate={data}></Marker>
                );
              })}
            {locations.length > 0 && (
              <MapViewDirections
                origin={locations[0]}
                destination={locations[locations.length - 1]}
                waypoints={locations}
                mode={'DRIVING'}
                strokeWidth={5}
                apikey={GOOGLE_KEY}
                onReady={result => {
                  console.log(result.distance);
                  // setdistance(Math.round(result.distance));
                  // setduration(result.duration);
                }}
              />
            )}
          </MapView>
              */}
      <View style={Styles.contentSection}>
        <FlatList
          data={orders}
          getItemLayout={getItemLayout}
          // initialScrollIndex={currentIndex}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              key={index}
              style={Styles.card}
              onPress={() => {
                navigate(`/order/${item.id}`, {
                  state: { index: index, page: 'pickup' },
                });
              }}>
              {/*  <Text style={Styles.name}>{item.business_owner}</Text>*/}
              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: '50%' }}>
                  <Text style={Styles.orderId}>Pickup Person</Text>
                  <Text style={Styles.orderIdNumber}>{item.pickup_name}</Text>
                  <Text style={Styles.orderId}>Order Id</Text>
                  <Text style={Styles.orderIdNumber}>{item.order_id}</Text>
                  <Text style={Styles.createdAt}>
                    {moment(item.created_at).format('DD-MM-YYYY ,  hh:mm a')}
                  </Text>
                </View>
                <View style={{ width: '50%' }}>
                  <Text style={[Styles.orderId, { textAlign: 'right' }]}>
                    Pickup Person Phone
                  </Text>
                  <Text
                    style={[
                      Styles.orderIdNumber,
                      { textAlign: 'right', left: -25 },
                    ]}>
                    {item.pickup_phone}
                  </Text>
                  <Text style={[Styles.orderId, { textAlign: 'right' }]}>
                    Pickup Pincode
                  </Text>
                  <Text style={[Styles.orderIdNumber, { textAlign: 'right' }]}>
                    {item.pickup_pincode}
                  </Text>
                  <Text style={[Styles.orderId, { textAlign: 'right' }]}>
                    Order Types
                  </Text>
                  <Text
                    style={[
                      Styles.orderIdNumber,
                      { textAlign: 'right', textTransform: 'uppercase' },
                    ]}>
                    {item.payment_mode}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    copyToClipboard(item.pickup_phone);
                  }}>
                  <Image
                    source={Copy}
                    style={{
                      width: 20,
                      height: 20,
                      zIndex: 3,
                      marginTop: 27,
                      marginLeft: -20,
                    }}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
      <View style={Styles.centeredView}>
        <Modal animationType="slide" transparent={true} visible={pincodemodal}>
          <View style={Styles.centeredView}>
            <View style={Styles.modalView}>
              <Text
                style={[Styles.orderId, { textAlign: 'center', fontSize: 17 }]}>
                Pickup Pincode's
              </Text>
              {loading ? (
                <ActivityIndicator size={'large'} color={'red'} />
              ) : (
                <FlatList
                  data={locations}
                  getItemLayout={getItemLayout}
                  numColumns={3}
                  initialScrollIndex={currentIndex}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        Styles.card,
                        {
                          width: '32%',
                          padding: 5,
                          margin: 5,
                          backgroundColor:
                            selocations.indexOf(item) < 0 ? 'black' : 'green',
                          marginHorizontal: 1,
                        },
                      ]}
                      onPress={() => {
                        setloading(true);
                        var i = selocations.indexOf(item);
                        if (i > -1) {
                          var se = selocations;
                          se.splice(i, 1);
                          setselocations(se);
                        } else {
                          var se = selocations;
                          se.push(item);
                          setselocations(se);
                        }
                        setOrders(
                          allOrders.filter(
                            obj => se.indexOf(obj.pickup_pincode) > -1,
                          ),
                        );
                        setAllPincodeOrders(
                          allOrders.filter(
                            obj => se.indexOf(obj.pickup_pincode) > -1,
                          ),
                        );
                        setTimeout(() => {
                          setloading(false);
                        }, 500);
                        console.log(se);
                      }}>
                      <Text
                        style={[
                          Styles.orderIdNumber,
                          { textAlign: 'center', color: 'white' },
                        ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
              <TouchableOpacity
                style={[
                  Styles.card,
                  {
                    width: '50%',
                    padding: 5,
                    backgroundColor: Constants.primaryColor,
                    marginHorizontal: '25%',
                  },
                ]}
                onPress={() => {
                  setpincodemodal(false);
                }}>
                <Text
                  style={[
                    Styles.orderIdNumber,
                    { textAlign: 'center', color: 'white' },
                  ]}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

export default Pickup;
