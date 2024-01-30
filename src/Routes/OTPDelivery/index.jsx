import React, { useState, useContext, useEffect } from 'react';
import {
  Text,
  View,
  Platform,
  ScrollView,
  Image,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import Button from '../../Components/Shared/Button';
import Styles from './OTPDelivery.styles';
import BreadCrumbs from '../../Components/Shared/BreadCrumbs';
import Constants from '../../Variables/colors.variables';
import { useNavigate, useParams } from 'react-router-native';
import OTPImage from '../../Assets/Images/otpScreen.png';
import OTPTextInput from 'react-native-otp-textinput';
import { AppContext } from '../../Context/App.context';
import firebaseSetup from '../../../setup';
import ConfirmationModal from '../../Components/ConfirmationModal';
import { NotificationContext } from '../../Context/Notification.context';
import { useRef } from 'react';
import { API_DOMAIN } from '../../Variables/globals.variables';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RNCamera } from 'react-native-camera';
const OTPDelivery = () => {
  const params = useParams();
  console.log('order id', params.id);
  const clickedRef = useRef();
  const session = useContext(AppContext);
  const navigate = useNavigate();
  const notification = useContext(NotificationContext);
  const { auth } = firebaseSetup();
  const [otp, setOtp] = useState(undefined);
  const [confirmation, setConfirmation] = useState(undefined);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [camerashots, setcameraShots] = useState();
  const cameraRef = useRef(null);
  const confirmApi = async () => {
    try {
      const token = await AsyncStorage.getItem('authData');
      const res = await axios.post(
        `${API_DOMAIN}/api/v1/update-order`,
        {
          post_value: 'completed',
          order_id: params.id,
        },
        {
          headers: {
            authorization: `Bearer ${JSON.parse(token).token}`,
          },
        },
      );
      if (res?.data) {
        session.setIsLoading(false);
        setShowConfirmModal(true);
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
  // const _id = session.forwardOrderDetails.order_id;
  // console.log(_id);
  useEffect(() => {
    // sendOTP();
  }, []);

  const sendOTP = async () => {
    const confirmation = await auth()
      .signInWithPhoneNumber(
        '+91' + session.forwardOrderDetails.customer_phone_number,
        true,
      )
      .catch(err => {
        if (err.code === 'auth/too-many-requests') {
          session.setIsLoading(false);
          return notification.setNotificationObject({
            type: 'error',
            message:
              'Too many requests for this number. Please try again in 24 hours.',
          });
        }
        session.setIsLoading(false);
        return notification.setNotificationObject({
          type: 'error',
          message: JSON.stringify(err),
        });
      });
    setConfirmation(confirmation);
  };

  // useEffect(() => {
  //   if (confirmation) {
  //     let unsubscribe;
  //     const getUser = async () => {
  //       unsubscribe = auth().onAuthStateChanged(user => {
  //         if (
  //           user &&
  //           !clickedRef.current &&
  //           user?.phone_number ===
  //             '+91' + session.forwardOrderDetails.customer_phone_number
  //         ) {
  //           confirmApi();
  //         }
  //       });
  //     };
  //     getUser();
  //     return unsubscribe;
  //   }
  // }, [confirmation]);

  const handleSubmits = async () => {
    // if (!otp) {
    //   return notification.setNotificationObject({
    //     type: 'error',
    //     message: 'Missing OTP',
    //   });
    // }
    // if (otp.length !== 4) {
    //   return notification.setNotificationObject({
    //     type: 'error',
    //     message: 'OTP length should be atleast 6',
    //   });
    // }
    session.setIsLoading(true);
    try {
      // if (confirmation) {
      //   try {
      //     await confirmation.confirm(otp);
      //     setConfirmation(undefined);
      //   } catch (err) {
      //     session.setIsLoading(false);
      //     return notification.setNotificationObject({
      //       type: 'error',
      //       message: 'Invalid OTP',
      //     });
      //   }
      // }
      clickedRef.current = true;
      try {
        // const form = new FormData();
        // form.append('post_value', 'completed');
        // form.append('order_id', params.id);
        // form.append('otp', '1234');
        // form.append('image', {
        //   uri:
        //     Platform.OS === 'android'
        //       ? `file:///${camerashots.uri}`
        //       : camerashots.uri,
        //   type: 'image/jpeg',
        //   name: 'image',
        // });
        // console.log('form data ', form);
        const token = await AsyncStorage.getItem('authData');
        const res = await axios.post(`${API_DOMAIN}/api/v1/update-order`, {
          method: 'POST',
          headers: {
            'Content-type': `multipart/form-date`,
            authorization: `Bearer ${JSON.parse(token).token}`,
            accept: 'application/json',
          },
          // body: form,
        });
        if (res?.data) {
          console.log('update-order', res?.data);
          session.setIsLoading(false);
          setShowConfirmModal(true);
        }
      } catch (error) {
        session.setIsLoading(false);
        if (error.response) {
          console.log(error.response.data);
          let firstError =
            Object.values(error.response.data) &&
            Object.values(error.response.data)[0] &&
            Object.values(error.response.data)[0][0];
          if (firstError) {
            return notification.setNotificationObject({
              type: 'error',
              message: 'ERROR: ' + firstError,
            });
          }
        }
        return notification.setNotificationObject({
          type: 'error',
          message: error,
        });
      }
    } catch (err) {
      session.setIsLoading(false);
      return notification.setNotificationObject({
        type: 'error',
        message: 'CATCH ERROR',
        err,
      });
    }
  };

  const handleSubmit = async () => {
    session.setIsLoading(true);
    clickedRef.current = true;
    const _data = new FormData();
    _data.append('post_value', 'completed');
    _data.append('order_id', params.id);
    _data.append('otp', '1234');
    _data.append('image', {
      uri: camerashots.uri,
      type: 'image/jpeg',
      name: 'delivery/image.jpg',
    });
    const token = await AsyncStorage.getItem('authData');
    console.log('_data data ', JSON.parse(token).token);
    try {
      const resp = await fetch(`${API_DOMAIN}/api/v1/update-order`, {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/plain, */*',
          authorization: `Bearer ${JSON.parse(token).token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: _data,
      });
      const ress = await resp.json();
      console.log('response', ress);
      if (ress?.detail) {
        session.setIsLoading(false);
        setShowConfirmModal(true);
      } else {
        console.log('ELSE ERROR');
        session.setIsLoading(false);
      }
    } catch (error) {
      console.log('CATCH ERROR', error);
      session.setIsLoading(false);
      return notification.setNotificationObject({
        type: 'error',
        message: 'CATCH ERROR',
        error,
      });
    }
  };

  const resendOTP = async () => {
    const confirmat = await auth()
      .signInWithPhoneNumber(
        '+91' + session.forwardOrderDetails.customer_phone_number,
        true,
      )
      .catch(err => {
        if (err.code === 'auth/too-many-requests') {
          session.setIsLoading(false);
          return notification.setNotificationObject({
            type: 'error',
            message:
              'Too many requests for this number. Please try again in 24 hours.',
          });
        }
        session.setIsLoading(false);
        return notification.setNotificationObject({
          type: 'error',
          message: JSON.stringify(err),
        });
      });
    setConfirmation(confirmat);
  };

  const openCamera = async camera => {
    if (camera) {
      const options = { quality: 0.5, base64: true };
      try {
        const data = await camera.takePictureAsync(options);
        setcameraShots(data);
        console.log('image', data.uri);
      } catch (error) {
        console.log(camera);
      }
    }
  };
  useEffect(() => {
    console.log('cam data', cameraRef);
  }, [cameraRef]);
  const PendingView = () => (
    <View
      style={{
        flex: 1,
        backgroundColor: 'lightgreen',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text>Waiting</Text>
    </View>
  );
  return (
    <>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      {showConfirmModal && (
        <ConfirmationModal
          hideCancelBtn
          confirmButtonText={'DONE'}
          handleConfirm={() => navigate('/dashboard')}
          text={'Order delivered successfully'}
          showSuccess
          handleClose={() => setShowConfirmModal(false)}
        />
      )}
      <ScrollView keyboardShouldPersistTaps="handled">
        {/*<BreadCrumbs showTimer resendOTP={resendOTP} />*/}
        <View style={Styles.contentSection}>
          <Text style={Styles.heading}>OTP Verification</Text>
          <Text style={Styles.subTitle}>
            Please take customer photo for verifications
          </Text>
          <View style={Styles.imageSection}>
            {!camerashots && (
              <RNCamera
                ref={cameraRef}
                style={Styles.preview}
                type={RNCamera.Constants.Type.back}
                flashMode={RNCamera.Constants.FlashMode.on}
                androidCameraPermissionOptions={{
                  title: 'Permission to use camera',
                  message: 'We need your permission to use your camera',
                  buttonPositive: 'Ok',
                  buttonNegative: 'Cancel',
                }}
                androidRecordAudioPermissionOptions={{
                  title: 'Permission to use audio recording',
                  message: 'We need your permission to use your audio',
                  buttonPositive: 'Ok',
                  buttonNegative: 'Cancel',
                }}>
                {({ camera, status, recordAudioPermissionStatus }) => {
                  if (status !== 'READY') return <PendingView />;
                  return (
                    <View
                      style={{
                        flex: 0,
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}>
                      <TouchableOpacity
                        onPress={() => openCamera(camera)}
                        style={Styles.capture}>
                        <Text style={{ fontSize: 14 }}> VERIFY </Text>
                      </TouchableOpacity>
                    </View>
                  );
                }}
              </RNCamera>
            )}
          </View>
          {camerashots && (
            <View>
              <Image
                source={{ uri: camerashots.uri }}
                style={{ height: 350, width: '100%' }}
              />
              <View style={{ flexDirection: 'row', marginTop: 50 }}>
                <View style={{ width: '50%' }}>
                  <Button
                    onPress={() => {
                      console.log(params.id);
                      handleSubmit();
                    }}
                    text={'SUBMIT'}
                    backgroundColor={Constants.primaryColor}
                  />
                </View>
                <View style={{ width: '50%' }}>
                  <Button
                    onPress={() => {
                      setcameraShots(null);
                      // handleSubmit();
                    }}
                    text={'RETAKE'}
                    backgroundColor={Constants.grayColor}
                  />
                </View>
              </View>
            </View>
          )}
          {/*   <OTPTextInput
            tintColor={'white'}
            offTintColor={'white'}
            textInputStyle={Styles.input}
            keyboardType="number-pad"
            inputCount={4}
            handleTextChange={e => setOtp(e)}
            />*/}
        </View>
      </ScrollView>
    </>
  );
};

export default OTPDelivery;
