import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  FlatList,
  BackHandler,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Styles from './Possesion.styles';
import Constants from '../../Variables/colors.variables';
import { useNavigate, useLocation } from 'react-router-native';
import BreadCrumbs from '../../Components/Shared/BreadCrumbsWithSearch';
import { AppContext } from '../../Context/App.context';
import axios from 'axios';
import { API_DOMAIN } from '../../Variables/globals.variables';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationContext } from '../../Context/Notification.context';
import moment from 'moment';
import MapView, { Polyline, Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

const Possesion = () => {
  const navigate = useNavigate();
  const queryParams = useLocation();
  const session = useContext(AppContext);
  const notification = useContext(NotificationContext);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [allPincodeOrders, setAllPincodeOrders] = useState([]);
  const [searchText, setSearchText] = useState(undefined);
  const [apiCallDone, setApiCallDone] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [locations, setlocations] = useState([]);
  const [selocations, setselocations] = useState([]);
  const { width, height } = Dimensions.get('window');
  const GOOGLE_KEY = 'AIzaSyCV50u9d5UHeWrx9WCKD2jf1kU1q12S9Ls';
  const [pincodemodal, setpincodemodal] = useState(false);
  const [loading, setloading] = useState(false);
  useEffect(() => {
    getPickups();
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
  const getPickups = async () => {
    try {
      session.setIsLoading(true);
      const token = await AsyncStorage.getItem('authData');
      const res = await axios.get(`${API_DOMAIN}/api/v1/possasion-list`, {
        headers: {
          authorization: `Bearer ${JSON.parse(token).token}`,
        },
      });
      if (res?.data) {
        setOrders(res.data.detail);
        console.log('possesion data', res.data.detail);
        if (queryParams.search && queryParams.search != '') {
          const index = queryParams.search.replace('?', '');
          setCurrentIndex(index);
        }
        var p = [];
        res.data.detail.forEach(e => {
          if (p.indexOf(e.delivery_pincode) < 0) {
            p.push(e.delivery_pincode);
          }
        });
        setlocations(p);
        setAllOrders(res.data.detail);
        setAllPincodeOrders(res.data.detail);
        session.setIsLoading(false);
        setApiCallDone(true);
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

  const handleFilter = () => {
    setOrders(allPincodeOrders.filter(obj => obj.order_id.indexOf(searchText)));
  };

  const getItemLayout = (data, index) => ({
    length: 140,
    offset: 140 * index,
    index,
  });

  return (
    <>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <BreadCrumbs
        title="Possesion"
        showSearchIcon
        value={searchText}
        onChange={setSearchText}
        onPress={() => {
          navigate('/dashboard');
        }}
        path=""
        index={-1}
        handleSearch={() => {
          handleFilter();
        }}
        onpincode={() => {
          setpincodemodal(true);
          console.log('10');
        }}
      />
      {apiCallDone && (
        <>
          <View style={Styles.contentSection}>
            <FlatList
              data={orders}
              getItemLayout={getItemLayout}
              initialScrollIndex={currentIndex}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  key={index}
                  style={Styles.card}
                  onPress={() => {
                    navigate(`/order/${item.id}`, {
                      state: { index: index, page: 'delivery' },
                    });
                  }}>
                  <Text style={Styles.name}>
                    {item.customer_first_name + ' ' + item.customer_last_name}
                  </Text>
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ width: '50%' }}>
                      <Text style={Styles.orderId}>Order Id</Text>
                      <Text style={Styles.orderIdNumber}>{item.order_id}</Text>
                      <Text style={Styles.createdAt}>
                        {moment(item.created_at).format('DD-MM-YYYY, hh:mm:ss')}
                      </Text>
                    </View>
                    <View style={{ width: '50%' }}>
                      <Text style={[Styles.orderId, { textAlign: 'right' }]}>
                        Delivery Pincode
                      </Text>
                      <Text
                        style={[Styles.orderIdNumber, { textAlign: 'right' }]}>
                        {item.delivery_pincode}
                      </Text>
                      <Text style={[Styles.orderId, { textAlign: 'right' }]}>
                        Order Types
                      </Text>
                      <Text
                        style={[Styles.orderIdNumber, { textAlign: 'right' }]}>
                        {item.payment_mode}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </>
      )}
      <View style={Styles.centeredView}>
        <Modal animationType="slide" transparent={true} visible={pincodemodal}>
          <View style={Styles.centeredView}>
            <View style={Styles.modalView}>
              <Text
                style={[Styles.orderId, { textAlign: 'center', fontSize: 17 }]}>
                Delivery Pincode's
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
                            obj => se.indexOf(obj.delivery_pincode) > -1,
                          ),
                        );
                        setAllPincodeOrders(
                          allOrders.filter(
                            obj => se.indexOf(obj.delivery_pincode) > -1,
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

export default Possesion;
