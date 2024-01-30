import React, { useState, useEffect } from 'react';
import BreadCrumbs from '../../Components/Shared/BreadCrumbs';
import {
  StatusBar,
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import Styles from './Statistics.styles';
import { useContext, useCallback } from 'react';
import { AppContext } from '../../Context/App.context';
import { NotificationContext } from '../../Context/Notification.context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_DOMAIN } from '../../Variables/globals.variables';
import { useNavigate } from 'react-router-native';
import DownIcon from '../../Assets/Images/downicon.png';
import Upload from '../../Assets/Images/up-arrow.png';
import colorsVariables from '../../Variables/colors.variables';
import Copy from '../../Assets/Images/copy.png';
import Clipboard from '@react-native-clipboard/clipboard';
import MonthPicker from 'react-native-month-year-picker';
import moment from 'moment';
const Statistics = () => {
  const navigate = useNavigate();
  const session = useContext(AppContext);
  const [errorMessage, setErrorMessage] = useState(undefined);
  const notification = useContext(NotificationContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [active, setActive] = useState('GENERAL');
  const [totalAmount, settotalAmount] = useState('');
  const [generalData, setGeneralData] = useState({
    total_number_of_pickup: 0,
    total_number_of_delivery: 0,
    not_paid_cod_amount: 0,
    salary: 0,
  });
  const [loading, setIsLoading] = useState(-1);
  const [cod, setCod] = useState([]);
  const [cash, setCash] = useState([]);
  const [client, setClient] = useState([]);
  const [notPaid, setNotPaid] = useState([]);
  const [possessive, setPossessive] = useState([]);
  const [apiCallMade, setApiCallMade] = useState(false);
  const [codClient, setCodClient] = useState([]);
  const [Order, setOrder] = useState(-1);
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  var sum = 0;

  useEffect(() => {
    getStatistics();
  }, []);

  const getStatistics = async () => {
    try {
      session.setIsLoading(true);
      const token = await AsyncStorage.getItem('authData');
      const res = await axios.get(`${API_DOMAIN}/api/v1/statistics-general`, {
        headers: {
          authorization: `Bearer ${JSON.parse(token).token}`,
        },
      });
      if (res?.data) {
        if (res.data.detail) {
          setErrorMessage(res.data.detail[0]);
        }
        setGeneralData(res.data);
        console.log('general data', res.data);
        session.setIsLoading(false);
        setApiCallMade(true);
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

  const getClient = async () => {
    try {
      session.setIsLoading(true);
      const token = await AsyncStorage.getItem('authData');
      const res = await axios.get(`${API_DOMAIN}/api/v1/statistics-client`, {
        headers: {
          authorization: `Bearer ${JSON.parse(token).token}`,
        },
      });
      if (res?.data) {
        // console.log(res.data);
        var d = [];
        var l = [];
        res.data.forEach(e => {
          if (e.user_id) {
            d[e.user_id] = e;
          } else {
            l = e;
          }
        });
        l.forEach(e => {
          if (d[e.order__user_id]) {
            if (d[e.order__user_id].orders) {
              if (e.paid_cod_amount != e.cod_paid_to_business_owner) {
                d[e.order__user_id].orders.push(e);
              }
            } else {
              d[e.order__user_id].orders = [];
              if (e.paid_cod_amount != e.cod_paid_to_business_owner) {
                d[e.order__user_id].orders.push(e);
              }
            }
          }
        });

        setClient(d);
        session.setIsLoading(false);
      }
    } catch (error) {
      session.setIsLoading(false);
      return notification.setNotificationObject({
        type: 'error',
        message: error?.response?.data?.detail,
      });
    }
  };

  const getCOD = async () => {
    try {
      session.setIsLoading(true);
      const token = await AsyncStorage.getItem('authData');
      // console.log(token, `${API_DOMAIN}/api/v1/statistics-cash`);
      const res = await axios.get(`${API_DOMAIN}/api/v1/statistics-cod`, {
        headers: {
          authorization: `Bearer ${JSON.parse(token).token}`,
        },
      });
      console.log('cod data', res?.data);
      if (res?.data) {
        var d = [];
        var l = [];
        res.data.forEach(e => {
          if (e.cod || e.cod == 0) {
            d[e.rider_id] = e;
          } else {
            l = e;
          }
        });
        // console.log(l);
        if (l) {
          l.forEach(e => {
            if (d[e.rider_id]) {
              if (d[e.rider_id].orders) {
                if (e.initial_cod != e.paid_cod) {
                  d[e.rider_id].orders.push(e);
                }
              } else {
                d[e.rider_id].orders = [];
                if (e.initial_cod != e.paid_cod) {
                  d[e.rider_id].orders.push(e);
                }
              }
            }
          });
        }
        // console.log(l);
        setCod(d);
        session.setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      session.setIsLoading(false);
      return notification.setNotificationObject({
        type: 'error',
        message: error?.response?.data?.detail,
      });
    }
  };
  const getCASH = async () => {
    try {
      session.setIsLoading(true);
      const token = await AsyncStorage.getItem('authData');
      const res = await axios.get(`${API_DOMAIN}/api/v1/statistics-cash`, {
        headers: {
          authorization: `Bearer ${JSON.parse(token).token}`,
        },
      });
      if (res?.data) {
        var s = [];
        res.data.forEach(e => {
          if (s[e.rider_id]) {
            s[e.rider_id].orders.push(e);
          } else {
            s[e.rider_id] = e;
            s[e.rider_id].total_order_price = 0;
            s[e.rider_id].orders = [e];
          }
        });
        if (s.length > 0) {
          s.forEach(e => {
            var t = 0;
            s[e.rider_id].orders.forEach(y => {
              t += parseFloat(y.order_order_price);
            });
            s[e.rider_id].total_order_price = t;
          });
        }
        setCash(s);
        session.setIsLoading(false);
      }
    } catch (error) {
      session.setIsLoading(false);
      return notification.setNotificationObject({
        type: 'error',
        message: error?.response?.data?.detail,
      });
    }
  };
  const handleUpdate = async id => {
    try {
      session.setIsLoading(true);
      const token = await AsyncStorage.getItem('authData');
      const res = await axios.post(
        `${API_DOMAIN}/api/v1/update-order-payment`,
        {
          post_value: 'paid',
          order_id: id,
        },
        {
          headers: {
            authorization: `Bearer ${JSON.parse(token).token}`,
          },
        },
      );
      if (res?.data) {
        getCASH();
        session.setIsLoading(false);
        return notification.setNotificationObject({
          type: 'successfully updated',
          message: 'Status Changed',
        });
      }
    } catch (error) {
      console.log(error);
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
  const handleUpdatepaid = async id => {
    try {
      session.setIsLoading(true);
      const token = await AsyncStorage.getItem('authData');
      console.log('mark paid id', id);
      const res = await axios.post(
        `${API_DOMAIN}/api/v1/update-order-payment-cod`,
        {
          post_value: 'paid',
          order_id: id,
        },
        {
          headers: {
            authorization: `Bearer ${JSON.parse(token).token}`,
          },
        },
      );
      if (res?.data) {
        console.log('paid status', res?.data);
        getCOD();
        session.setIsLoading(false);
        return notification.setNotificationObject({
          type: 'successfully updated',
          message: 'Status Changed',
        });
      } else {
        console.log('ERROR', error);
        session.setIsLoading(false);
      }
    } catch (error) {
      console.log('CATCH ERROR', error);
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

  const handleUpdateClient = async id => {
    try {
      session.setIsLoading(true);
      const token = await AsyncStorage.getItem('authData');
      console.log('mark paid id', id);
      const res = await axios.post(
        `${API_DOMAIN}/api/v1/update-order-payment-client`,
        {
          post_value: 'paid',
          order_id: id,
        },
        {
          headers: {
            authorization: `Bearer ${JSON.parse(token).token}`,
          },
        },
      );
      if (res?.data) {
        console.log('paid status', res?.data);
        getClient();
        session.setIsLoading(false);
        return notification.setNotificationObject({
          type: 'successfully updated',
          message: 'Status Changed',
        });
      } else {
        console.log('ERROR', error);
        session.setIsLoading(false);
      }
    } catch (error) {
      console.log('CATCH ERROR', error);
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

  const getNotPaid = async () => {
    try {
      session.setIsLoading(true);
      const token = await AsyncStorage.getItem('authData');
      const res = await axios.get(`${API_DOMAIN}/api/v1/not-paid-cod-list`, {
        headers: {
          authorization: `Bearer ${JSON.parse(token).token}`,
        },
      });

      if (res?.data) {
        console.log('not paid data', res?.data);
        setNotPaid(res.data.detail);
        // settotalAmount(res.data.detail.initial_cod_amount);
        res.data.detail.forEach(function (obj) {
          console.log('obj', obj);
          sum += obj.initial_cod_amount;
        });
        console.log('obj', sum);
        settotalAmount(sum);
        session.setIsLoading(false);
      }
    } catch (error) {
      session.setIsLoading(false);
      return notification.setNotificationObject({
        type: 'error',
        message: error?.response?.data?.detail,
      });
    }
  };

  const getPossessive = async () => {
    try {
      session.setIsLoading(true);
      const token = await AsyncStorage.getItem('authData');
      const res = await axios.get(
        `${API_DOMAIN}/api/v1/current-possessed-parcel`,
        {
          headers: {
            authorization: `Bearer ${JSON.parse(token).token}`,
          },
        },
      );
      if (res?.data) {
        console.log('Possessive List', res?.data.detail);
        setPossessive(res.data.detail);
        session.setIsLoading(false);
      }
    } catch (error) {
      session.setIsLoading(false);
      return notification.setNotificationObject({
        type: 'error',
        message: error?.response?.data?.detail,
      });
    }
  };

  const items = [
    {
      label: 'General',
      value: 'GENERAL',
      onPress: () => {
        getStatistics();
        setActive('GENERAL');
      },
    },
    {
      label: 'Pending COD',
      value: 'NOT_PAID',
      onPress: () => {
        getNotPaid();
        setActive('NOT_PAID');
      },
    },
    {
      label: 'Possession',
      value: 'POSSESSIVE',
      onPress: () => {
        getPossessive();
        setActive('POSSESSIVE');
      },
    },
    {
      label: 'COD',
      value: 'COD',
      onPress: () => {
        getCOD();
        setActive('COD');
      },
    },
    // {
    //   label: 'CASH',
    //   value: 'CASH',
    //   onPress: () => {
    //     getCASH();
    //     setActive('CASH');
    //   },
    // },
    {
      label: 'Client',
      value: 'CLIENT',
      onPress: () => {
        getClient();
        setActive('CLIENT');
      },
    },
  ];

  const getStatus = status => {
    let data = {
      open: 'Open',
      cancelled: 'Cancelled',
      pickup: 'Picked Up',
      head_office: 'Head Office',
      out_for_delivery: 'Out For Delivery',
      intransit: 'In Transit',
      completed: 'Completed',
      return_requested: 'Requested Returned',
      return_intransit: 'Returned In Transit',
      returned: 'Returned',
    };
    return data[status];
  };

  const copyToClipboard = d => {
    Clipboard.setString(d);
    notification.setNotificationObject({
      type: 'success',
      message: 'copied',
    });
    console.log(d);
  };
  const totalPickup = generalData.total_number_of_pickup * 10;
  const totalPrepaid = generalData.total_number_of_delivery * 45;
  const totalDelivery = generalData.total_number_of_cod_delivery * 60;

  const showPicker = useCallback(value => setShow(value), []);
  const onValueChange = useCallback(
    (event, newDate) => {
      const selectedDate = newDate || date;
      showPicker(false);
      setDate(selectedDate);
    },
    [date, showPicker],
  );
  return (
    <>
      {apiCallMade && (
        <>
          <StatusBar backgroundColor="white" barStyle="dark-content" />
          <BreadCrumbs title="Statistics" />
          <View style={Styles.buttonSection}>
            <FlatList
              horizontal
              data={items}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    style={
                      active === item.value ? Styles.active : Styles.inactive
                    }
                    onPress={() => {
                      item.onPress();
                    }}>
                    <Text
                      style={
                        active === item.value
                          ? Styles.activeButtonText
                          : Styles.inactiveButtonText
                      }>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              minHeight: Dimensions.get('window').height - 50,
              height: 'auto',
              backgroundColor: 'red',
              flex:
                active === 'GENERAL'
                  ? 1
                  : active === 'CLIENT'
                  ? client.length > 0
                    ? 0
                    : 1
                  : active === 'COD'
                  ? cod.length > 0
                    ? 0
                    : 1
                  : active === 'NOT_PAID'
                  ? notPaid.length > 0
                    ? 0
                    : 1
                  : active === 'POSSESSIVE' && possessive.length > 0
                  ? 0
                  : 1,
            }}>
            <View style={Styles.container}>
              {active === 'GENERAL' && (
                <View
                  scrollEnabled={true}
                  style={
                    errorMessage ? Styles.errorSection : Styles.generalSection
                  }>
                  {errorMessage ? (
                    <Text style={Styles.errorMessage}>{errorMessage}</Text>
                  ) : (
                    <>
                      <View style={Styles.vvstyle}>
                        <TouchableOpacity
                          onPress={() => showPicker(true)}
                          style={Styles.monthSlotStyles}>
                          <Text style={Styles.datstyles}>
                            {moment(date).format('MMMM-YYYY')
                              ? moment(date).format('MMMM-YYYY')
                              : 'Monthly slot of salary'}
                          </Text>
                        </TouchableOpacity>
                        {show && (
                          <MonthPicker
                            onChange={onValueChange}
                            value={date}
                            minimumDate={new Date(2023, 1)}
                            maximumDate={new Date()}
                            locale="en"
                          />
                        )}
                      </View>
                      <View style={Styles.generalCard1}>
                        <Text style={Styles.generalHeading}>
                          Total number of pickups
                        </Text>
                        <Text style={Styles.generalSubHeading}>
                          {generalData.total_number_of_pickup}
                        </Text>
                      </View>
                      <View style={Styles.generalCard2}>
                        <Text style={Styles.generalHeading}>
                          Total number of PREPAID orders deliveries
                        </Text>
                        <Text style={Styles.generalSubHeading}>
                          {generalData.total_number_of_delivery}
                        </Text>
                      </View>
                      <View style={Styles.generalCard2}>
                        <Text style={Styles.generalHeading}>
                          Total number of COD orders deliveries
                        </Text>
                        <Text style={Styles.generalSubHeading}>
                          {generalData.total_number_of_cod_delivery}
                        </Text>
                      </View>
                      <View style={Styles.generalCard3}>
                        <Text style={Styles.generalHeading}>
                          Total Pending COD
                        </Text>
                        <Text style={Styles.generalSubHeading}>
                          ₹ {generalData.not_paid_cod_amount}
                        </Text>
                      </View>
                      <View style={Styles.generalCard2}>
                        <Text style={Styles.generalHeading}>Salary</Text>
                        <Text style={Styles.generalSubHeading}>
                          ₹ {totalPickup + totalPrepaid + totalDelivery}{' '}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              )}
              {active === 'COD' && (
                <ScrollView style={Styles.codSection}>
                  {cod.map((obj, ind) => {
                    return (
                      <View key={ind}>
                        <TouchableOpacity style={Styles.codCard}>
                          <View style={Styles.codLeftSection}>
                            <Text style={Styles.codName}>
                              {obj.rider_name.substring(0, 1)}
                            </Text>
                          </View>
                          <View style={Styles.codRightCard}>
                            <Text style={Styles.codName}>{obj.rider_name}</Text>
                            <Text style={Styles.codAmount}>₹ {obj.cod}</Text>
                          </View>
                          {loading != ind ? (
                            <TouchableOpacity
                              style={Styles.DownArrowView}
                              onPress={() => setIsLoading(ind)}>
                              <Image
                                source={DownIcon}
                                style={Styles.DownArrow}
                              />
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              style={Styles.DownArrowView}
                              onPress={() => setIsLoading(-1)}>
                              <Image source={Upload} style={Styles.UpArrow} />
                            </TouchableOpacity>
                          )}
                        </TouchableOpacity>
                        {loading == ind ? (
                          <View
                            style={[
                              Styles.codCardDown,
                              { flexDirection: 'column' },
                            ]}>
                            <View
                              style={{
                                flexDirection: 'row',
                                paddingVertical: 10,
                                borderBottomWidth: 1,
                                backgroundColor: colorsVariables.primaryColor,
                                paddingHorizontal: 5,
                              }}>
                              <Text
                                style={[
                                  Styles.codName,
                                  {
                                    width: '40%',
                                    textAlign: 'left',
                                    color: 'white',
                                  },
                                ]}>
                                ORDER ID
                              </Text>
                              <Text
                                style={[
                                  Styles.codName,
                                  {
                                    width: '30%',
                                    textAlign: 'right',
                                    color: 'white',
                                  },
                                ]}>
                                INITIAL COD
                              </Text>
                              <Text
                                style={[
                                  Styles.codName,
                                  {
                                    width: '30%',
                                    textAlign: 'right',
                                    color: 'white',
                                  },
                                ]}>
                                Paid COD
                              </Text>
                            </View>

                            {obj.orders.map((ord, index) => {
                              return (
                                <View>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      paddingVertical: 10,
                                      borderBottomWidth: 0.5,
                                      // justifyContent: 'space-evenly',
                                    }}>
                                    <Text
                                      style={[
                                        Styles.codName,
                                        { width: '40%', textAlign: 'left' },
                                      ]}>
                                      {ord.order__order_id + ' '}
                                    </Text>
                                    <TouchableOpacity
                                      onPress={() => {
                                        copyToClipboard(
                                          ord.order__order_id + ' ',
                                        );
                                      }}>
                                      <Image
                                        source={Copy}
                                        style={{
                                          width: 20,
                                          height: 20,
                                          zIndex: 3,
                                        }}
                                      />
                                    </TouchableOpacity>
                                    <Text
                                      style={[
                                        Styles.codName,
                                        { width: '30%', textAlign: 'right' },
                                      ]}>
                                      ₹ {ord.initial_cod + ' '}
                                    </Text>
                                    <Text
                                      style={[
                                        Styles.codName,
                                        {
                                          width: '30%',
                                          textAlign: 'right',
                                          right: 10,
                                        },
                                      ]}>
                                      ₹ {ord.paid_cod + ' '}
                                    </Text>
                                  </View>
                                  <TouchableOpacity
                                    style={{
                                      width: '40%',
                                      backgroundColor: 'red',
                                    }}
                                    onPress={() => {
                                      handleUpdatepaid(ord.order__order_id);
                                      console.log(
                                        'ord.order_id',
                                        ord.order__order_id,
                                      );
                                    }}>
                                    <Text
                                      style={[
                                        Styles.codName,
                                        { color: 'white' },
                                      ]}>
                                      Mark as paid
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              );
                            })}
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                </ScrollView>
              )}
              {active === 'CASH' && (
                <View style={Styles.codSection}>
                  {cash.map((obj, ind) => {
                    return (
                      <View key={ind}>
                        <View style={Styles.codCard}>
                          <View style={Styles.codLeftSection}>
                            <Text style={Styles.codName}>
                              {obj.rider_name.substring(0, 1)}
                            </Text>
                          </View>
                          <View style={Styles.codRightCard}>
                            <Text style={Styles.codName}>{obj.rider_name}</Text>
                            <Text style={Styles.codAmount}>
                              ₹ {obj.total_order_price}
                            </Text>
                          </View>
                          {loading != ind ? (
                            <TouchableOpacity
                              style={Styles.DownArrowView}
                              onPress={() => setIsLoading(ind)}>
                              <Image
                                source={DownIcon}
                                style={Styles.DownArrow}
                              />
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              style={Styles.DownArrowView}
                              onPress={() => setIsLoading(-1)}>
                              <Image source={Upload} style={Styles.UpArrow} />
                            </TouchableOpacity>
                          )}
                        </View>
                        {loading == ind ? (
                          <View
                            style={[
                              Styles.codCardDown,
                              { flexDirection: 'column' },
                            ]}>
                            {obj.orders.map((ord, index) => {
                              return (
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    paddingVertical: 10,
                                  }}>
                                  <Text
                                    style={[Styles.codName, { width: '30%' }]}>
                                    {ord.order_id + ' '}
                                  </Text>
                                  <TouchableOpacity
                                    onPress={() => {
                                      copyToClipboard(ord.order_id + ' ');
                                    }}>
                                    <Image
                                      source={Copy}
                                      style={{
                                        width: 20,
                                        height: 20,
                                        zIndex: 3,
                                      }}
                                    />
                                  </TouchableOpacity>
                                  <Text
                                    style={[Styles.codName, { width: '30%' }]}>
                                    ₹ {ord.order_order_price + ' '}
                                  </Text>
                                  <TouchableOpacity
                                    style={{
                                      width: '40%',
                                      backgroundColor: 'red',
                                    }}
                                    onPress={() => {
                                      handleUpdate(ord.order_id);
                                    }}>
                                    <Text
                                      style={[
                                        Styles.codName,
                                        { color: 'white' },
                                      ]}>
                                      Mark as paid
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              );
                            })}
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              )}

              {active === 'CLIENT' && (
                <View style={Styles.codSection}>
                  {client.map((obj, ind) => {
                    return (
                      <View key={ind}>
                        <View style={Styles.codCard}>
                          <View style={Styles.codLeftSection}>
                            <Text style={Styles.codName}>
                              {obj.user_full_name &&
                              obj.user_full_name.length > 0
                                ? obj.user_full_name.substring(0, 1)
                                : ''}
                            </Text>
                          </View>
                          <View style={Styles.codRightCard}>
                            <Text style={Styles.codName}>
                              {obj.user_full_name}
                            </Text>
                            <Text style={Styles.codAmount}>₹ {obj.cod}</Text>
                          </View>
                          {Order != ind ? (
                            <TouchableOpacity
                              style={Styles.DownArrowView}
                              onPress={() => setOrder(ind)}>
                              <Image
                                source={DownIcon}
                                style={Styles.DownArrow}
                              />
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              style={Styles.DownArrowView}
                              onPress={() => setOrder(-1)}>
                              <Image source={Upload} style={Styles.UpArrow} />
                            </TouchableOpacity>
                          )}
                        </View>
                        {Order == ind ? (
                          <View
                            style={[
                              Styles.codCardDown,
                              { flexDirection: 'column' },
                            ]}>
                            <View
                              style={{
                                flexDirection: 'row',
                                paddingVertical: 10,
                                borderBottomWidth: 1,
                                backgroundColor: colorsVariables.primaryColor,
                                paddingHorizontal: 5,
                              }}>
                              <Text
                                style={[
                                  Styles.codName,
                                  {
                                    width: '40%',
                                    textAlign: 'left',
                                    color: 'white',
                                  },
                                ]}>
                                ORDER ID
                              </Text>
                              <Text
                                style={[
                                  Styles.codName,
                                  {
                                    width: '30%',
                                    textAlign: 'right',
                                    color: 'white',
                                  },
                                ]}>
                                INITIAL COD
                              </Text>
                              <Text
                                style={[
                                  Styles.codName,
                                  {
                                    width: '30%',
                                    textAlign: 'right',
                                    color: 'white',
                                  },
                                ]}>
                                Paid COD
                              </Text>
                            </View>

                            {obj.orders.map((ord, index) => {
                              return (
                                <View>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      paddingVertical: 10,
                                      borderBottomWidth: 0.5,
                                    }}>
                                    <Text
                                      style={[
                                        Styles.codName,
                                        { width: '40%', textAlign: 'left' },
                                      ]}>
                                      {ord.order__order_id + ' '}
                                    </Text>
                                    <TouchableOpacity
                                      onPress={() => {
                                        copyToClipboard(
                                          ord.order__order_id + ' ',
                                        );
                                      }}>
                                      <Image
                                        source={Copy}
                                        style={{
                                          width: 20,
                                          height: 20,
                                          zIndex: 3,
                                        }}
                                      />
                                    </TouchableOpacity>
                                    <Text
                                      style={[
                                        Styles.codName,
                                        { width: '30%', textAlign: 'right' },
                                      ]}>
                                      ₹ {ord.paid_cod_amount + ' '}
                                    </Text>
                                    <Text
                                      style={[
                                        Styles.codName,
                                        { width: '30%', textAlign: 'right' },
                                      ]}>
                                      ₹ {ord.cod_paid_to_business_owner + ' '}
                                    </Text>
                                  </View>
                                  <TouchableOpacity
                                    style={{
                                      width: '40%',
                                      backgroundColor: 'red',
                                    }}
                                    onPress={() => {
                                      handleUpdateClient(ord.order__order_id);
                                      console.log(ord.order__order_id);
                                    }}>
                                    <Text
                                      style={[
                                        Styles.codName,
                                        { color: 'white' },
                                      ]}>
                                      Mark as paid
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              );
                            })}
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              )}
              {active === 'NOT_PAID' && (
                <View style={Styles.codSection}>
                  <View style={Styles.codLeftSections}>
                    <Text style={Styles.codName}>Total Pending Amount :</Text>
                    <Text
                      style={[
                        Styles.codName,
                        { fontSize: 18, fontWeight: 'bold' },
                      ]}>
                      {''} ₹ {totalAmount}
                    </Text>
                  </View>
                  {notPaid.map((obj, ind) => {
                    return (
                      <View key={ind}>
                        <View style={Styles.codCard}>
                          <View style={Styles.codLeftSection}>
                            <Text style={Styles.codName}>
                              {obj.company_name}
                            </Text>
                          </View>
                          <View style={Styles.codRightCard}>
                            <Text style={Styles.codName}>
                              {obj.company_name}
                            </Text>
                            <Text style={Styles.codAmount}>
                              ₹ {obj.initial_cod_amount}
                            </Text>
                            <Text style={Styles.orderID}>
                              {obj.long_order_id}
                            </Text>
                            <TouchableOpacity
                              onPress={() => {
                                copyToClipboard(obj.long_order_id);
                              }}>
                              <Image
                                source={Copy}
                                style={{
                                  width: 20,
                                  height: 20,
                                  zIndex: 3,
                                  bottom: 22,
                                  left: 110,
                                }}
                              />
                            </TouchableOpacity>

                            <Text>{getStatus(obj.order_status)}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
              {active === 'POSSESSIVE' && (
                <View style={Styles.codSection}>
                  {possessive.map((obj, ind) => {
                    return (
                      <TouchableOpacity
                        key={ind}
                        style={Styles.codCard}
                        onPress={() => navigate(`/order/${obj.order_id}`)}>
                        <View style={Styles.codLeftSection}>
                          <Text style={Styles.codName}>
                            {obj.company_name.substring(0, 1)}
                          </Text>
                        </View>
                        <View style={Styles.codRightCard}>
                          <Text style={Styles.codName}>
                            {obj.company_name && obj.company_name.length > 0
                              ? obj.company_name.substring(0, 1)
                              : ''}
                          </Text>
                          <Text style={Styles.orderID}>
                            {obj.long_order_id}
                          </Text>
                          <TouchableOpacity
                            onPress={() => {
                              copyToClipboard(obj.long_order_id);
                            }}>
                            <Image
                              source={Copy}
                              style={{
                                width: 20,
                                height: 20,
                                zIndex: 3,
                                bottom: 22,
                                left: 110,
                              }}
                            />
                          </TouchableOpacity>
                          <Text>{getStatus(obj.order_status)}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>
        </>
      )}
    </>
  );
};

export default Statistics;
