import { lazy } from 'react';
const SignIn = lazy(() => import('./SignIn'));
const Dashboard = lazy(() => import('./Dashboard'));
const PhoneNumberSignIn = lazy(() => import('./PhoneNumberSignIn'));
const ForgotPassword = lazy(() => import('./ForgotPassword'));
const BarCodeScanner = lazy(() => import('./BarCodeScanner'));
const ChangePassword = lazy(() => import('./ChangePassword'));
const Pickup = lazy(() => import('./Pickup'));
const Delivery = lazy(() => import('./Delivery'));
const Possesion = lazy(() => import('./Possesion'));
const CustomerSupport = lazy(() => import('./CustomerSupport'));
const SpecificDelivery = lazy(() => import('./SpecificDelivery'));
const OTPDelivery = lazy(() => import('./OTPDelivery'));
const Statistics = lazy(() => import('./Statistics'));
const Settings = lazy(() => import('./Settings'));
const Profile = lazy(() => import('./Profile'));

export default {
  SignIn,
  Dashboard,
  ForgotPassword,
  PhoneNumberSignIn,
  BarCodeScanner,
  Pickup,
  ChangePassword,
  Delivery,
  SpecificDelivery,
  OTPDelivery,
  Statistics,
  Settings,
  Profile,
  CustomerSupport,
  Possesion,
};
