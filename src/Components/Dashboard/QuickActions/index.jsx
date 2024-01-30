import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  Button,
  FlatList,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import Styles from './QuickActions.styles';
import { useNavigate } from 'react-router-native';
import rechargeImg from '../../../Assets/Images/delivery.png';
import HelpLine from '../../../Assets/Images/helplineBlack.png';
import Parc from '../../../Assets/Images/parc.png';
import barcodeImg from '../../../Assets/Images/barcode.png';
import statisticsImg from '../../../Assets/Images/statistics.png';
import Constants from '../../../Variables/colors.variables';
import addOrderImg from '../../../Assets/Images/pickup.png';
import { API_DOMAIN } from '../../../Variables/globals.variables';
import axios from 'axios';
import moment from 'moment';
import { NotificationContext } from '../../../Context/Notification.context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RBSheet from 'react-native-raw-bottom-sheet';
import InputWithLabel from '../../Shared/InputWithLabel';
const QuickActions = () => {
  const navigate = useNavigate();
  const [userType, setuserType] = useState(false);
  const [businessowners, setbusinessowners] = useState([]);
  const [businessowner, setbusinessowner] = useState([]);
  const [transactions, settransactions] = useState([]);
  const [selectedId, setSelectedId] = useState();
  const [recharge, setRecharge] = useState();
  const [selectedowner, setselectedowner] = useState(null);
  const [tokend, settokend] = useState(null);
  const [balance, setbalance] = useState(0);
  const [mybalance, setmybalance] = useState(0);
  const notification = useContext(NotificationContext);
  const [awbNumber, setAwbNumber] = useState('');
  useEffect(() => {
    getProfileDetails();
  }, []);
  const refRBSheet = useRef();
  const rechangewallet = async () => {
    if (recharge && recharge > 0 && recharge <= mybalance) {
      Alert.alert(
        'Confirm Recharge',
        'Are you sure to send money to the selected user',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: 'Send Money',
            onPress: async () => {
              try {
                var url = `${API_DOMAIN}/api/v1/create-sales-pay-order`;
                const res = await axios.post(
                  url,
                  { order_amount: recharge, user_id: selectedId },
                  {
                    headers: {
                      authorization: tokend,
                    },
                  },
                );
                if (res?.data) {
                  notification.setNotificationObject({
                    type: 'success',
                    message: 'Recharge Successfull',
                  });
                  setbalance(parseFloat(balance) + parseFloat(recharge));
                  setmybalance(parseFloat(mybalance) - parseFloat(recharge));
                  setRecharge(0);
                }
              } catch (error) {
                if (error.response) {
                  let firstError =
                    Object.values(error.response.data) &&
                    Object.values(error.response.data)[0] &&
                    Object.values(error.response.data)[0][0];
                  if (firstError) {
                    notification.setNotificationObject({
                      type: 'error',
                      message: firstError,
                    });
                  }
                }
              }
            },
          },
        ],
      );
    } else {
      notification.setNotificationObject({
        type: 'error',
        message: 'Please recharge below then your wallet balance',
      });
    }
  };
  const getuserbalance = async user_id => {
    try {
      var url = `${API_DOMAIN}/api/v1/get-business-user-balance?user_id=${user_id}`;
      const res = await axios.get(url, {
        headers: {
          authorization: tokend,
        },
      });
      if (res?.data) {
        setbalance(res?.data);
      }
    } catch (error) {
      if (error.response) {
        let firstError =
          Object.values(error.response.data) &&
          Object.values(error.response.data)[0] &&
          Object.values(error.response.data)[0][0];
        if (firstError) {
          notification.setNotificationObject({
            type: 'error',
            message: firstError,
          });
        }
      }
    }
  };

  const getProfileDetails = async () => {
    // session.setIsLoading(true);
    const token = await AsyncStorage.getItem('authData');
    const loginData = await AsyncStorage.getItem('loginData');
    if (loginData) {
      setuserType(JSON.parse(loginData).user_type);
      if (JSON.parse(loginData).user_type == 'sales') {
        try {
          var url = `${API_DOMAIN}/api/v1/get-internal-user`;
          var t = `Bearer ${JSON.parse(token).token}`;
          settokend(t);
          const res = await axios.get(url, {
            headers: {
              authorization: t,
            },
          });
          if (res?.data) {
            setbusinessowners(res?.data);
            setbusinessowner(res?.data);
          }
        } catch (error) {
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
        }
        try {
          var url = `${API_DOMAIN}/api/v1/get-sales-wallet-amount`;
          var t = `Bearer ${JSON.parse(token).token}`;
          const res = await axios.get(url, {
            headers: {
              authorization: t,
            },
          });
          if (res?.data) {
            setmybalance(res?.data.amount);
          }
        } catch (error) {
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
        }
        try {
          var url = `${API_DOMAIN}/api/v1/transactions`;
          var t = `Bearer ${JSON.parse(token).token}`;
          const res = await axios.get(url, {
            headers: {
              authorization: t,
            },
          });
          if (res?.data) {
            settransactions(res?.data);
          }
        } catch (error) {}
      }
    }
    try {
      const res = await axios.get(
        `${API_DOMAIN}/api/v1/get-internal-user-profile-detail`,
        {
          headers: {
            authorization: `Bearer ${JSON.parse(token).token}`,
          },
        },
      );
      if (res?.data?.detail) {
        // console.log(res?.data);
        session.setIsLoading(false);
      }
    } catch (error) {
      if (error.response) {
        let firstError =
          Object.values(error.response.data) &&
          Object.values(error.response.data)[0] &&
          Object.values(error.response.data)[0][0];
        if (firstError) {
          // return notification.setNotificationObject({
          //   type: 'error',
          //   message: firstError,
          // });
        }
      }
    }
  };
  const renderItemtransactions = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          // setSelectedId(item.id);
          // refRBSheet.current.close();
          // setselectedowner(item);
          // getuserbalance(item.id);
        }}
        style={{
          backgroundColor: '#fff',
          paddingHorizontal: 10,
          borderBottomColor: '#6e3b6e',
          borderBottomWidth: 1,
        }}>
        <View style={{ flexDirection: 'row' }}>
          <Text
            style={[
              Styles.actionText,
              {
                width: '50%',
                textAlign: 'left',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: '#000',
              },
            ]}>
            {item.transaction_id}
          </Text>
          <Text
            style={[
              Styles.actionText,
              { width: '50%', color: '#000', textAlign: 'right' },
            ]}>
            RS. {item.final_amount}
          </Text>
        </View>
        <Text style={[Styles.actionText, { color: '#000', textAlign: 'left' }]}>
          {moment(item.created_at).format('DD-MM-YYYY ,  hh:mm:ss')}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    const backgroundColor = item.id === selectedId ? '#6e3b6e' : '#fff';
    const color = item.id === selectedId ? 'white' : 'black';
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedId(item.id);
          refRBSheet.current.close();
          setbalance(0);
          setselectedowner(item);
          getuserbalance(item.id);
        }}
        style={{
          backgroundColor: backgroundColor,
          paddingHorizontal: 10,
          borderBottomColor: '#6e3b6e',
          borderBottomWidth: 1,
        }}>
        <View style={{ flexDirection: 'row' }}>
          <Text
            style={[
              Styles.actionText,
              {
                width: '50%',
                textAlign: 'left',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: color,
              },
            ]}>
            {item.full_name}
          </Text>
          <Text
            style={[
              Styles.actionText,
              { width: '50%', color: color, textAlign: 'right' },
            ]}>
            {item.phone_number}
          </Text>
        </View>
        <Text style={[Styles.actionText, { color: color, textAlign: 'left' }]}>
          {item.email}
        </Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ paddingHorizontal: 24 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          margin: 15,
          marginTop: 16,
        }}>
        <Text style={Styles.heading}>
          Dashboard{' '}
          {userType &&
            userType == 'sales' &&
            '( Wallet Balance RS. ' + mybalance + ' )'}
        </Text>
        <TouchableOpacity
          onPress={() => {
            Linking.openURL('tel: 9953099953');
          }}
          style={{ flexDirection: 'row' }}>
          <Image
            source={HelpLine}
            style={{ height: 30, width: 30, left: -10 }}
          />
          <Text
            style={{
              fontSize: 18,
              fontFamily: 'Poppins-SemiBold',
              color: Constants.headingColor,
            }}>
            Help
          </Text>
        </TouchableOpacity>
      </View>

      {userType && userType != 'sales' ? (
        <View>
          <View style={Styles.actionsSection}>
            <TouchableOpacity
              style={Styles.actionCardAddOrder}
              onPress={() => navigate('/pickup')}>
              <Image source={addOrderImg} style={Styles.actionImage} />
              <Text style={Styles.actionText}>Pickup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={Styles.actionCardQuickRecharge}
              onPress={() => navigate('/delivery')}>
              <Image source={rechargeImg} style={Styles.actionImage} />
              <Text style={Styles.actionText}>Delivery</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {userType && userType != 'sales' ? (
        <View>
          {userType && userType == 'riders' ? (
            <TouchableOpacity
              style={Styles.actionCardCalculator}
              onPress={() => navigate('/barcode-scanner')}>
              <Image source={barcodeImg} style={Styles.actionImage} />
              <Text style={Styles.actionText}>Barcode</Text>
            </TouchableOpacity>
          ) : (
            <View style={Styles.actionsSection}>
              <TouchableOpacity
                style={Styles.actionCardCustomer}
                onPress={() => navigate('/barcode-scanner')}>
                <Image source={barcodeImg} style={Styles.actionImage} />
                <Text style={Styles.actionText}>Parcel Details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={Styles.actionCardScanner}
                onPress={() => navigate('/statistics')}>
                <Image source={statisticsImg} style={Styles.actionImage} />
                <Text style={Styles.actionText}>Statistics</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View>
          {selectedowner ? (
            <View>
              <TouchableOpacity
                onPress={() => {
                  refRBSheet.current.open();
                }}
                style={{
                  backgroundColor: '#6e3b6e',
                  paddingHorizontal: 10,
                  borderBottomColor: '#6e3b6e',
                  borderBottomWidth: 1,
                }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text
                    style={[
                      Styles.actionText,
                      {
                        width: '50%',
                        textAlign: 'left',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        color: 'white',
                      },
                    ]}>
                    {selectedowner.full_name}
                  </Text>
                  <Text
                    style={[
                      Styles.actionText,
                      { width: '50%', color: 'white', textAlign: 'right' },
                    ]}>
                    Balance: RS. {balance}
                  </Text>
                </View>
                <Text
                  style={[
                    Styles.actionText,
                    { color: 'white', textAlign: 'left' },
                  ]}>
                  {selectedowner.email}
                </Text>
              </TouchableOpacity>
              <View style={Styles.btnContainer}>
                <View>
                  <TextInput
                    placeholder="Enter amount"
                    keyboardType="number-pad"
                    maxLength={5}
                    value={recharge}
                    onChangeText={value => {
                      setRecharge(value);
                    }}
                    style={Styles.rechargeInputStyles}
                  />
                </View>
                <TouchableOpacity
                  style={Styles.rechargeBtnStyles}
                  onPress={() => {
                    rechangewallet();
                  }}>
                  <Text style={Styles.rechargeText}>Recharge</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Button
              title="Seclect owner to recharge"
              onPress={() => refRBSheet.current.open()}
            />
          )}
          <Text style={Styles.heading}>Transactions </Text>

          <FlatList
            data={transactions}
            renderItem={renderItemtransactions}
            keyExtractor={item => item.id}
          />

          <RBSheet
            ref={refRBSheet}
            height={500}
            openDuration={250}
            customStyles={{
              container: {
                justifyContent: 'center',
                alignItems: 'center',
              },
            }}>
            <View style={{ width: '90%' }}>
              <InputWithLabel
                label={'Search'}
                onChange={value => {
                  setAwbNumber(value);
                  var f = businessowner.filter(
                    e =>
                      e.full_name.toLowerCase().indexOf(value.toLowerCase()) >
                      -1,
                  );
                  setbusinessowners(f);
                }}
                value={awbNumber}
              />
            </View>
            <FlatList
              data={businessowners}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              extraData={selectedId}
            />
          </RBSheet>
        </View>
      )}
    </View>
  );
};

export default QuickActions;
