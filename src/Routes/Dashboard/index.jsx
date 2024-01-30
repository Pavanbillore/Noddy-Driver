import React, { useEffect, useContext, useState } from 'react';
import { ScrollView, StatusBar } from 'react-native';
import Styles from './Dashboard.styles';
import TopHeader from '../../Components/Headers/TopHeader';
import QuickActions from '../../Components/Dashboard/QuickActions';
import { AppContext } from '../../Context/App.context';
import { API_DOMAIN } from '../../Variables/globals.variables';
import axios from 'axios';
import Constants from '../../Variables/colors.variables';
import { NotificationContext } from '../../Context/Notification.context';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Dashboard = () => {
  const session = useContext(AppContext);
  const notification = useContext(NotificationContext);
  useEffect(() => {
    session.isCurrentHomePage.current = true;
    return () => {
      if (session.isCurrentHomePage.current) {
        session.isCurrentHomePage.current = false;
      }
    };
  }, []);

  return (
    <>
      <StatusBar
        backgroundColor={Constants.primaryColor}
        barStyle="light-content"
      />
      <TopHeader />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={Styles.container}>
        <QuickActions />
      </ScrollView>
    </>
  );
};

export default Dashboard;
